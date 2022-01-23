import {Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import ProductVariant from "@core/models/ProductVariant.model";
import AttrValue from "@core/models/AttrValue.model";
import {Transaction} from "sequelize";
import {getAttrValuesHash} from "@core/helpers/utils";

@Table({
    tableName: 'product_variant_attr_hash',
    timestamps: false
})
export default class ProductVariantAttrHash extends Model<ProductVariantAttrHash> implements IProductVariantAttrHash {

    @PrimaryKey
    @ForeignKey(() => ProductVariant)
    @Column
    product_variant_id: number;

    @Column({
        type: DataType.BIGINT
    })
    attrs_hash: number;

    static async updateHash(productVariantID: number, transaction?: Transaction): Promise<IProductVariantAttrHash['attrs_hash'] | null> {
        const attrValues = await AttrValue.findAll({
            where: {product_variant_id: productVariantID},
            transaction
        });

        if (!attrValues.length) {
            await ProductVariantAttrHash.destroy({where: {product_variant_id: productVariantID}, transaction});
            return null;
        }

        const hash = getAttrValuesHash(attrValues);

        const newProductHash: IProductVariantAttrHash = {
            product_variant_id: productVariantID,
            attrs_hash: hash
        };

        await ProductVariantAttrHash.upsert(newProductHash, {transaction});

        return hash;
    }

}

export interface IProductVariantAttrHash {
    product_variant_id: number;
    attrs_hash: number;
}
