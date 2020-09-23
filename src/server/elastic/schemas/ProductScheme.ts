export const ProductScheme = {
    "attr_set_id": {
        "type": "integer"
    },
    "created_at": {
        "type": "date"
    },
    "id": {
        "type": "integer"
    },
    "name": {
        "type": "text"
    },
    "updated_at": {
        "type": "date"
    },
    "variants": {
        "type": "nested",
        "properties": {
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
                    "pcd": {
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
            },
            "created_at": {
                "type": "date"
            },
            "id": {
                "type": "long"
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
            }
        }
    }
};
