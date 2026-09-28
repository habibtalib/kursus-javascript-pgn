// io/raster.js — GeoTIFF dengan geotiff.js. TODO [H4-S2].
// ECW: tiada pustaka JS — tukar dahulu: gdal_translate -of COG input.ecw output.tif (atau QGIS).
//   import { fromArrayBuffer } from 'geotiff';
//   const imej = await (await fromArrayBuffer(buf)).getImage();
//   imej.getWidth(), imej.getHeight(), imej.getBoundingBox(), await imej.readRasters()
/* eslint-disable no-unused-vars -- fail rangka (stub): buang baris ini apabila anda melaksanakan fungsi */

/** @returns {Promise<{ lebar, tinggi, bbox, min, max, nilai }>} */
export async function bacaGeoTIFF(arrayBuffer) {
  throw new Error('TODO [H4-S2]: bacaGeoTIFF');
}
