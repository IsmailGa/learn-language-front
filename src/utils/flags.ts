/**
 * Maps language codes to ISO 3166-1-alpha-2 country codes for flag-icons.
 * 
 * @param langCode The language code (e.g., 'en', 'ko', 'ru', 'uz')
 * @returns The corresponding country code for the flag
 */
export const getFlagCode = (langCode: string | undefined | null): string => {
    if (!langCode) return 'un'; // Unknown / Global
    
    const mapping: Record<string, string> = {
        'ko': 'kr', // Korean -> South Korea
        'en': 'us', // English -> USA (common default)
        'ru': 'ru', // Russian -> Russia
        'uz': 'uz', // Uzbek -> Uzbekistan
        'ja': 'jp', // Japanese -> Japan
        'zh': 'cn', // Chinese -> China
        'fr': 'fr', // French -> France
        'de': 'de', // German -> Germany
        'es': 'es', // Spanish -> Spain
        // Add more mappings as needed
    };

    return mapping[langCode.toLowerCase()] || langCode.toLowerCase();
};
