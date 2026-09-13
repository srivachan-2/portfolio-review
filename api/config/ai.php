<?php

class AIConfig
{
    public static function apiKey(): string
    {
        return getenv('GEMINI_API_KEY') ?: 'REPLACE_WITH_YOUR_GEMINI_API_KEY';
    }

    public static function apiUrl(): string
    {
        return 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';
    }

    public static function model(): string
    {
        return 'gemini-3.6-flash';
    }

    public static function timeoutSeconds(): int
    {
        return 30;
    }
}