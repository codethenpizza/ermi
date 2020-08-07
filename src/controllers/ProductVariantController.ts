import {Router} from "express";
import ProductVariantCreateAction from "@actions/ProductVariant/ProductVariantCreateAction";
import ProductVariantUpdateAction from "@actions/ProductVariant/ProductVariantUpdateAction";
import ProductVariantDeleteAction from "@actions/ProductVariant/ProductVariantDeleteAction";

const ProductVariantController = Router();

ProductVariantController.post('/', ...ProductVariantCreateAction.action);
ProductVariantController.put('/:id', ...ProductVariantUpdateAction.action); //update only product variant w/ attrs
ProductVariantController.delete('/:id', ...ProductVariantDeleteAction.action);

export {ProductVariantController};
