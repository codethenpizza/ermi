export const DiskScheme = {
    "id": {
        "type": "long"
    },
    "name": {
        "type": "keyword"
    },
    "created_at": {
        "type": "date"
    },
    "in_stock_qty": {
        "type": "integer"
    },
    "is_available": {
        "type": "boolean"
    },
    "is_discount": {
        "type": "boolean"
    },
    "price": {
        "type": "scaled_float",
        "scaling_factor": 100
    },
    "product_id": {
        "type": "integer"
    },
    "updated_at": {
        "type": "date"
    },
    "vendor_code": {
        "type": "keyword"
    },
    "attrs": {
        "properties": {
            "bolts-count": {
                "properties": {
                    "name": {
                        "type": "text"
                    },
                    "value": {
                        "type": "short"
                    },
                    "slug": {
                        "type": "keyword"
                    }
                }
            },
            "bolts-spacing": {
                "properties": {
                    "name": {
                        "type": "text"
                    },
                    "value": {
                        "type": "short"
                    },
                    "slug": {
                        "type": "keyword"
                    }
                }
            },
            "brand": {
                "properties": {
                    "name": {
                        "type": "text"
                    },
                    "value": {
                        "type": "keyword"
                    },
                    "slug": {
                        "type": "keyword"
                    }
                }
            },
            "color": {
                "properties": {
                    "name": {
                        "type": "text"
                    },
                    "value": {
                        "type": "keyword"
                    },
                    "slug": {
                        "type": "keyword"
                    }
                }
            },
            "dia": {
                "properties": {
                    "name": {
                        "type": "text"
                    },
                    "value": {
                        "type": "double"
                    },
                    "slug": {
                        "type": "keyword"
                    }
                }
            },
            "diameter": {
                "properties": {
                    "name": {
                        "type": "text"
                    },
                    "value": {
                        "type": "short"
                    },
                    "slug": {
                        "type": "keyword"
                    }
                }
            },
            "et": {
                "properties": {
                    "name": {
                        "type": "text"
                    },
                    "value": {
                        "type": "short"
                    },
                    "slug": {
                        "type": "keyword"
                    }
                }
            },
            "model": {
                "properties": {
                    "name": {
                        "type": "text",
                    },
                    "slug": {
                        "type": "keyword",
                    },
                    "value": {
                        "type": "keyword",
                    }
                }
            },
            "pcd": {
                "properties": {
                    "name": {
                        "type": "text"
                    },
                    "value": {
                        "type": "keyword",
                    },
                    "slug": {
                        "type": "keyword"
                    }
                }
            },
            "recommended-price": {
                "properties": {
                    "name": {
                        "type": "text"
                    },
                    "value": {
                        "type": "scaled_float",
                        "scaling_factor": 100
                    },
                    "slug": {
                        "type": "keyword"
                    }
                }
            },
            "type": {
                "properties": {
                    "name": {
                        "type": "text"
                    },
                    "value": {
                        "type": "keyword"
                    },
                    "slug": {
                        "type": "keyword"
                    }
                }
            },
            "supplier": {
                "properties": {
                    "name": {
                        "type": "text"
                    },
                    "value": {
                        "type": "keyword"
                    },
                    "slug": {
                        "type": "keyword"
                    }
                }
            },
            "width": {
                "properties": {
                    "name": {
                        "type": "text"
                    },
                    "value": {
                        "type": "scaled_float",
                        "scaling_factor": 10
                    },
                    "slug": {
                        "type": "keyword"
                    }
                }
            }
        }
    }
};
