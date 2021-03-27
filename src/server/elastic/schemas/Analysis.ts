export const LOWERCASE_NORMALIZER = 'lowercase_normalizer';

export const Normalizers = {
    [LOWERCASE_NORMALIZER]: {
        "type": "custom",
        "char_filter": [],
        "filter": ["lowercase", "asciifolding"]
    }
};
