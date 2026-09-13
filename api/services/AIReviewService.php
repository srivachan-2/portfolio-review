<?php

/**
 * AI Portfolio Review Service
 *
 * Fetches the public portfolio webpage, extracts useful text,
 * sends the information to Gemini, and validates the structured review.
 */

class AIReviewException extends Exception {}

class AIReviewService
{
    /**
     * Generate an AI review.
     *
     * @return array{
     *   scores: array{
     *     creativity:int,
     *     technical:int,
     *     presentation:int,
     *     overall:int
     *   },
     *   comment:string,
     *   model:string
     * }
     */
    public function review(array $portfolio): array
    {
        $websiteContent = $this->fetchPortfolioWebsite(
            $portfolio['link'] ?? ''
        );

        $prompt = $this->buildPrompt(
            $portfolio,
            $websiteContent
        );

        $raw = $this->callProvider($prompt);

        return $this->parseAndValidate($raw);
    }

    /**
     * Fetch the public portfolio website.
     */
    private function fetchPortfolioWebsite(string $url): string
    {
        $url = trim($url);

        if ($url === '') {
            return 'No portfolio URL was provided.';
        }

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return 'The portfolio URL is invalid.';
        }

        $scheme = strtolower(
            parse_url($url, PHP_URL_SCHEME) ?? ''
        );

        if (!in_array($scheme, ['http', 'https'], true)) {
            return 'The portfolio URL must use HTTP or HTTPS.';
        }

        $ch = curl_init($url);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 5,

            CURLOPT_HTTPHEADER => [
                'User-Agent: Mozilla/5.0 (compatible; PortfolioReviewBot/1.0)'
            ],

            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 20,

            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        $html = curl_exec($ch);

        $httpCode = curl_getinfo(
            $ch,
            CURLINFO_HTTP_CODE
        );

        $curlError = curl_error($ch);

        curl_close($ch);

        if ($html === false) {
            return 'The portfolio website could not be fetched.';
        }

        if ($httpCode < 200 || $httpCode >= 400) {
            return "The portfolio website returned HTTP {$httpCode}.";
        }

        if (trim($html) === '') {
            return 'The portfolio website returned an empty page.';
        }

        return $this->extractWebsiteText($html);
    }

    /**
     * Extract readable text from HTML.
     */
    private function extractWebsiteText(string $html): string
    {
        /*
         * Remove elements that generally do not contain useful
         * portfolio content.
         */
        $html = preg_replace(
            '/<(script|style|noscript|svg|canvas|iframe)[^>]*>.*?<\/\1>/is',
            ' ',
            $html
        );

        /*
         * Extract useful metadata.
         */
        $metadata = [];

        if (
            preg_match(
                '/<title[^>]*>(.*?)<\/title>/is',
                $html,
                $match
            )
        ) {
            $metadata[] = 'Page title: ' .
                trim(strip_tags($match[1]));
        }

        preg_match_all(
            '/<meta[^>]+(?:name|property)=["\'](?:description|og:title|og:description)["\'][^>]+content=["\'](.*?)["\']/is',
            $html,
            $metaMatches
        );

        foreach ($metaMatches[1] ?? [] as $meta) {
            $metadata[] = trim(
                html_entity_decode(
                    $meta,
                    ENT_QUOTES | ENT_HTML5,
                    'UTF-8'
                )
            );
        }

        /*
         * Convert headings into readable text.
         */
        preg_match_all(
            '/<h[1-6][^>]*>(.*?)<\/h[1-6]>/is',
            $html,
            $headingMatches
        );

        $headings = [];

        foreach ($headingMatches[1] ?? [] as $heading) {
            $text = trim(
                html_entity_decode(
                    strip_tags($heading),
                    ENT_QUOTES | ENT_HTML5,
                    'UTF-8'
                )
            );

            if ($text !== '') {
                $headings[] = $text;
            }
        }

        /*
         * Convert the rest of the page to plain text.
         */
        $text = strip_tags($html);

        $text = html_entity_decode(
            $text,
            ENT_QUOTES | ENT_HTML5,
            'UTF-8'
        );

        /*
         * Normalize whitespace.
         */
        $text = preg_replace(
            '/\s+/u',
            ' ',
            $text
        );

        $text = trim($text);

        /*
         * Limit the amount of website text sent to Gemini.
         * This keeps requests small and prevents enormous pages
         * from consuming the API quota.
         */
        $maxLength = 12000;

        if (mb_strlen($text) > $maxLength) {
            $text = mb_substr(
                $text,
                0,
                $maxLength
            );

            $text .= "\n[Website content truncated]";
        }

        $result = [];

        if (!empty($metadata)) {
            $result[] =
                "WEBSITE METADATA:\n" .
                implode("\n", $metadata);
        }

        if (!empty($headings)) {
            $result[] =
                "WEBSITE HEADINGS:\n" .
                implode("\n", array_unique($headings));
        }

        if ($text !== '') {
            $result[] =
                "WEBSITE TEXT:\n" .
                $text;
        }

        if (empty($result)) {
            return 'No readable text could be extracted from the portfolio website.';
        }

        return implode(
            "\n\n",
            $result
        );
    }

    /**
     * Build the Gemini prompt.
     */
    private function buildPrompt(
        array $portfolio,
        string $websiteContent
    ): string {
        $title =
            $portfolio['title'] ?? '';

        $description =
            $portfolio['description'] ?? '';

        $link =
            $portfolio['link'] ?? '';

        $category =
            $portfolio['category'] ?? 'unspecified';

        $tags =
            implode(
                ', ',
                $portfolio['tags'] ?? []
            );

        return <<<PROMPT
You are an experienced professional portfolio reviewer.

Evaluate the portfolio using BOTH:

1. The information stored in the portfolio database.
2. The publicly accessible website content extracted from the portfolio URL.

Respond with ONLY a valid JSON object.

Do not use markdown.
Do not use ```json fences.
Do not add any explanation outside the JSON.

Use exactly this structure:

{
  "creativity": 1,
  "technical": 1,
  "presentation": 1,
  "overall": 1,
  "comment": "3-6 sentences of specific, constructive feedback."
}

SCORING:

creativity:
Evaluate originality, uniqueness, visual/interactive ideas, and the
creative quality of the portfolio or project.

technical:
Evaluate the technical quality that can reasonably be inferred from the
provided project information and website content.

Do NOT invent technologies or implementation details that cannot be
verified.

presentation:
Evaluate visual polish, clarity, organization, typography, content
structure, usability, and how effectively the work is presented.

overall:
Give a balanced holistic score based on the available evidence.

IMPORTANT:

- Every score must be an INTEGER from 1 to 10.
- Do not automatically give the same score to every category.
- Score each category independently.
- Use the evidence provided.
- Do not invent facts.
- If technical implementation cannot be verified from the public page,
  acknowledge that limitation instead of pretending you inspected source code.
- A visually polished portfolio can score well in presentation even if
  technical details are unavailable.
- A sparse portfolio should receive lower scores where the evidence is
  genuinely insufficient.
- Give specific and useful improvement suggestions.

DATABASE INFORMATION

Title:
{$title}

Category:
{$category}

Tags:
{$tags}

Portfolio URL:
{$link}

Description:
{$description}

PUBLIC WEBSITE CONTENT

{$websiteContent}

Now evaluate the portfolio and return ONLY the JSON object.
PROMPT;
    }

    /**
     * Call Google's Gemini API.
     */
    private function callProvider(
        string $prompt
    ): string {
        $apiKey =
            AIConfig::apiKey();

        if (
            !$apiKey ||
            $apiKey ===
                'REPLACE_WITH_YOUR_GEMINI_API_KEY'
        ) {
            throw new AIReviewException(
                'AI review is not configured. Set the GEMINI_API_KEY environment variable.'
            );
        }

        $payload = json_encode([
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => $prompt
                        ]
                    ]
                ]
            ],

            'generationConfig' => [
                'temperature' => 0.4,
                'responseMimeType' => 'application/json'
            ]
        ]);

        if ($payload === false) {
            throw new AIReviewException(
                'Could not create Gemini request payload.'
            );
        }

        $ch = curl_init(
            AIConfig::apiUrl()
        );

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,

            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'x-goog-api-key: ' . $apiKey
            ],

            CURLOPT_TIMEOUT =>
                AIConfig::timeoutSeconds(),

            CURLOPT_CONNECTTIMEOUT => 10
        ]);

        $response =
            curl_exec($ch);

        $httpCode =
            curl_getinfo(
                $ch,
                CURLINFO_HTTP_CODE
            );

        $curlError =
            curl_error($ch);

        curl_close($ch);

        if ($response === false) {
            throw new AIReviewException(
                'Gemini request failed: ' .
                $curlError
            );
        }

        if (
            $httpCode < 200 ||
            $httpCode >= 300
        ) {
            $errorMessage =
                $response;

            $decodedError =
                json_decode(
                    $response,
                    true
                );

            if (
                isset(
                    $decodedError['error']['message']
                )
            ) {
                $errorMessage =
                    $decodedError['error']['message'];
            }

            throw new AIReviewException(
                "Gemini API returned HTTP {$httpCode}: " .
                substr(
                    $errorMessage,
                    0,
                    500
                )
            );
        }

        $decoded =
            json_decode(
                $response,
                true
            );

        if (!is_array($decoded)) {
            throw new AIReviewException(
                'Gemini returned an invalid JSON response.'
            );
        }

        $content =
            $decoded['candidates'][0]['content']['parts'][0]['text']
            ?? null;

        if (!$content) {
            throw new AIReviewException(
                'Gemini response did not contain generated content.'
            );
        }

        return $content;
    }

    /**
     * Validate Gemini's generated JSON.
     */
    private function parseAndValidate(
        string $raw
    ): array {
        $cleaned =
            trim($raw);

        /*
         * Defensive cleanup if Gemini returns
         * markdown fences despite the instruction.
         */
        $cleaned =
            preg_replace(
                '/^```(?:json)?\s*/i',
                '',
                $cleaned
            );

        $cleaned =
            preg_replace(
                '/\s*```$/',
                '',
                $cleaned
            );

        $cleaned =
            trim($cleaned);

        $data =
            json_decode(
                $cleaned,
                true
            );

        if (!is_array($data)) {
            throw new AIReviewException(
                'Could not parse Gemini response as JSON.'
            );
        }

        $keys = [
            'creativity',
            'technical',
            'presentation',
            'overall'
        ];

        $scores = [];

        foreach ($keys as $key) {

            $value =
                $data[$key] ?? null;

            if (
                !is_numeric($value) ||
                $value < 1 ||
                $value > 10
            ) {
                throw new AIReviewException(
                    "Gemini response missing or invalid score for '{$key}'."
                );
            }

            $scores[$key] =
                (int) round($value);
        }

        $comment =
            trim(
                $data['comment'] ?? ''
            );

        if ($comment === '') {
            throw new AIReviewException(
                'Gemini response missing written feedback.'
            );
        }

        return [
            'scores' => $scores,
            'comment' => $comment,
            'model' => AIConfig::model()
        ];
    }
}