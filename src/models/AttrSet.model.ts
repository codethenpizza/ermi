import {BelongsToMany, Column, DataType, HasMany, Model, Table, Unique} from "sequelize-typescript";
import Attribute from "@models/Attribute.model";
import AttrSetAttr, {IAttrSetAttr} from "@models/AttrSetAttr.model";
import {DestroyOptions, Op, Transaction} from "sequelize";
import slugify from "slugify";
import Product from "@models/Product.model";

@Table({
    tableName: 'attribute_set',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class AttrSet extends Model<AttrSet> {

    @Unique
    @Column({
        allowNull: false
    })
    set name(val: string) {
        this.setDataValue('slug', slugify(val, {lower: true}));
        this.setDataValue('name', val);
    }
    get name() {
        return this.getDataValue('name');
    }

    @Column({
        unique: true
    })
    slug: string;

    @Column({
        type: DataType.TEXT
    })
    desc: string;

    @Column({
        type: DataType.JSON
    })
    scheme: string;

    @BelongsToMany(() => Attribute, () => AttrSetAttr)
    attributes: Attribute[];

    @HasMany(() => Product)
    products: Product[];

    async saveWR() {
        const attributes = this.attributes.map(x => x.id);
        const {id, desc, name} = this;
        if (id) {
            return AttrSet.updateWR({id, attributes, desc, name});
        } else {
            return AttrSet.createWR({attributes, desc, name});
        }
    }

    static async createWR({name, desc, scheme, attributes}: IAttrSet, trans?: Transaction): Promise<AttrSet> {
        const transaction = trans ? trans : await this.sequelize.transaction();
        try {
            let attrSet = await this.create({name, desc, scheme}, {transaction});
            await AttrSetAttr.bulkCreate(attributes.map<IAttrSetAttr>(attr_id => ({
                attr_id,
                attr_set_id: attrSet.id
            })), {transaction});
            attrSet = await attrSet.reload({include: [Attribute], transaction});
            trans || await transaction.commit();
            return attrSet;
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }

    static async updateWR({id, name, desc, attributes}: IAttrSet): Promise<AttrSet> {
        const transaction = await this.sequelize.transaction();
        try {
            const update = await this.update({name, desc}, {where: {id}, transaction});

            if(!!update) {
                throw new Error(`attribute set with id=${id} not found`);
            }

            if (attributes?.length) {
                await AttrSetAttr.destroy({where: {attr_set_id: id}, transaction});
                await AttrSetAttr.bulkCreate(attributes.map<IAttrSetAttr>(attr_id => ({
                    attr_id,
                    attr_set_id: id
                })), {transaction});
            }

            const attrSet = await AttrSet.findOne({where: {id}, include: [Attribute], transaction});
            await transaction.commit();
            return attrSet;
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }

    static async destroyWR(options: DestroyOptions): Promise<boolean> {
        const attrSet = await this.findAll(options);
        const destroyed = await this.destroy(options);
        if (!destroyed) {
            return false;
        }

        const ids = attrSet.map(x => x.id);
        await AttrSetAttr.destroy({where: {attr_set_id: {[Op.in]: ids}}});
        return true;
    }
}

export interface IAttrSet {
    id?: number;
    name?: string;
    desc?: string;
    attributes?: number[];
    scheme?: Object;
}
