<?php
/**
 * Minimal self-contained JWT implementation (HS256).
 * Avoids requiring Composer/firebase-php-jwt so this drops straight
 * into XAMPP's htdocs with zero extra install steps.
 *
 * IMPORTANT: Change JWT_SECRET before deploying anywhere real.
 */

class Auth
{
    private const SECRET = 'CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_KEY';
    private const ALGO = 'HS256';
    private const EXPIRY_SECONDS = 60 * 60 * 24; // 24 hours

    public static function generateToken(array $payload): string
    {
        $header = self::base64UrlEncode(json_encode([
            'typ' => 'JWT',
            'alg' => self::ALGO,
        ]));

        $payload['iat'] = time();
        $payload['exp'] = time() + self::EXPIRY_SECONDS;

        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', "{$header}.{$payloadEncoded}", self::SECRET, true);
        $signatureEncoded = self::base64UrlEncode($signature);

        return "{$header}.{$payloadEncoded}.{$signatureEncoded}";
    }

    /**
     * Returns the decoded payload array on success, or null if invalid/expired.
     */
    public static function verifyToken(?string $token): ?array
    {
        if (!$token || substr_count($token, '.') !== 2) {
            return null;
        }

        [$header, $payload, $signature] = explode('.', $token);

        $expectedSignature = self::base64UrlEncode(
            hash_hmac('sha256', "{$header}.{$payload}", self::SECRET, true)
        );

        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        $decodedPayload = json_decode(self::base64UrlDecode($payload), true);

        if (!$decodedPayload || ($decodedPayload['exp'] ?? 0) < time()) {
            return null;
        }

        return $decodedPayload;
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
