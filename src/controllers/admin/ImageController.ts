import {createController} from "@controllers/Controller";
import {ImageUploadAction} from "@actions/admin/Image/ImageUploadAction";
import {ImageDeleteAction} from "@actions/admin/Image/ImageDeleteAction";
import {ImageListAction} from "@actions/admin/Image/ImageListAction";

export const ImageController = createController([
    {method: 'get', path: '/', action: ImageListAction},
    {method: 'post', path: '/', action: ImageUploadAction},
    {method: 'delete', path: '/:id', action: ImageDeleteAction},
]);
