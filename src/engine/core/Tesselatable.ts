/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export interface Tesselatable extends RenderObject {

    tesselate(): PrimitiveList;

    getWorldBounds(o2w: Matrix4): BoundingBox;
}