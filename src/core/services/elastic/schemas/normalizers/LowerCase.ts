export const LOWERCASE_NORMALIZER = 'lowercase_normalizer';

export const lowerCase = {
    [LOWERCASE_NORMALIZER]: {
        "type": "custom",
        "char_filter": [],
        "filter": ["lowercase", "asciifolding"]
    }
};

