import {EsReqFilter} from "@actions/front/types";

export interface Make {
    slug: string;
    name: string;
    name_en: string;
}

export interface Year {
    slug: number;
    name: number;
}

export interface Model {
    slug: string;
    name: string;
    name_en: string;
}

export interface SByModelResp {
    market: {
        slug: string;
        abbr: string;
        name: string;
        name_en: string;
    },
    body: any;
    trim: string;
    slug: string;
    generation: {
        name: string;
        bodies: {
            title: string;
            image: string;
        }
        start_year: number;
        end_year: number;
        years: number[];
    }
    stud_holes: number;
    pcd: number;
    centre_bore: number;
    lock_type: string;
    lock_text: string;
    bolt_pattern: string;
    power: {
        kW: number;
        PS: number;
        hp: number;
    }
    engine_type: string;
    fuel: string;
    wheels: WheelResp[];
}

export interface WheelResp {
    showing_fp_only: boolean;
    is_stock: boolean;
    front: Wheel,
    rear: Wheel
}

export interface Wheel {
    tire_pressure: {
        bar: number;
        psi: number;
        kPa: number;
    }
    rim: string;
    rim_diameter: number;
    rim_width: number;
    rim_offset: number;
    tire: string;
    tire_sizing_system: string;
    tire_construction: string;
    tire_width: number;
    tire_aspect_ratio: number;
    tire_diameter: number;
    tire_section_width: number;
    tire_is_82series: boolean;
    load_index: number;
    speed_index: string;
}

export interface ParamsPair {
    diameter: number;
    width: number;
    et: number;
    boltsCount: number;
    boltsSpacing: number;
    esFilters: EsReqFilter[][];
}
