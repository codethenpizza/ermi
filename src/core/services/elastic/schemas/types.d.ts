export namespace EsScheme {

    type Scheme<T = any> = {
        [key in keyof T]: Prop;
    };

    type PropType =
        'long'
        | 'keyword'
        | 'boolean'
        | 'integer'
        | 'text'
        | 'nested'
        | 'scaled_float'
        | 'date'
        | 'short'
        | 'double';

    type Prop<T = any> = PropOptions<T> | NestedPropOptions<T>;

    interface PropOptions<T = any> {
        type?: PropType;
        index?: boolean;
        normalizer?: string;
        scaling_factor?: number;
        properties?: Scheme<T>;
    }

    interface NestedPropOptions<T = any> extends PropOptions {
        type: 'nested',
        properties: Scheme<T>;
    }

}
