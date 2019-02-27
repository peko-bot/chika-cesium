import Cesium from "cesium";
import { ajax } from "../urlHelper";

export default class Trunk {
  constructor(root: string | Element, options?: any) {
    const viewer = new Cesium.Viewer(root, options);
    const imageryProviderViewModels =
      viewer.baseLayerPicker.viewModel.imageryProviderViewModels;
    viewer.baseLayerPicker.viewModel.selectedImagery =
      imageryProviderViewModels[6];
    const canvas = viewer.scene.canvas;
    const ellipsoid = viewer.scene.globe.ellipsoid;
    const handler = new Cesium.ScreenSpaceEventHandler(canvas);
    handler.setInputAction((movement: any) => {
      const cartesian = viewer.camera.pickEllipsoid(
        movement.endPosition,
        ellipsoid
      );
      if (cartesian) {
        viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    viewer.scene.primitives
      .add(
        new Cesium.Cesium3DTileset({
          url: "../mock/3dtileout/tileset.json",
          maximumScreenSpaceError: 2,
          maximumNumberOfLoadedTiles: 1000
        })
      )
      .readyPromise.then((tileset: any) => {
        // this.drawPoints(viewer);
        const boundingSphere = tileset.boundingSphere;
        viewer.camera.viewBoundingSphere(
          boundingSphere,
          new Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius)
        );
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      })
      .otherwise((error: any) => {
        console.log(error);
      });
  }

  drawPoints = (viewer: any) => {
    ajax({
      url: "../mock/LatLon.json",
      success: ({ data }: { data: Array<any> }) => {
        for (let item of data) {
          const { lng, lat, name } = item;
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
              parseFloat(lng),
              parseFloat(lat)
            ),
            name,
            ellipse: {
              semiMinorAxis: 100,
              semiMajorAxis: 100,
              material: Cesium.Color.RED.withAlpha(0.5)
            }
          });
        }
      }
    });
  };
}
