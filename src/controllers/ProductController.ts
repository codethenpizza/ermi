import {Router} from "express";
import ProductCreateAction from "@actions/Product/ProductCreateAction";
import ProductGetAction from "@actions/Product/ProductGetAction";
import ProductDeleteAction from "@actions/Product/ProductDeleteAction";
import ProductUpdateAction from "@actions/Product/ProductUpdateAction";
import ProductGetListAction from "@actions/Product/ProductGetListAction";

const ProductController = Router();

ProductController.get('/', ...ProductGetListAction.action);
ProductController.get('/:id', ...ProductGetAction.action);
ProductController.post('/', ...ProductCreateAction.action);
ProductController.put('/:id', ...ProductUpdateAction.action); //update only product w/ product variant and attrs
ProductController.delete('/:id', ...ProductDeleteAction.action);

export {ProductController};
