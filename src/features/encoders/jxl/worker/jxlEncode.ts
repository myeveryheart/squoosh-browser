/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { JXLModule } from '../../../../../codecs/jxl/enc/jxl_enc.js';
import type { EncodeOptions } from '../shared/meta';

import { initEmscriptenModule } from '../../../../features/worker-utils';
import { threads, simd } from 'wasm-feature-detect';

import jxlEncoderSimd from '../../../../../codecs/jxl/enc/jxl_enc_mt_simd.js';
import jxlEncoderMt from '../../../../../codecs/jxl/enc/jxl_enc_mt.js';
import jxlEncoder from '../../../../../codecs/jxl/enc/jxl_enc.js';

let emscriptenModule: Promise<JXLModule>;

async function init() {
  if (await threads()) {
    if (await simd()) {
      return initEmscriptenModule(jxlEncoderSimd);
    }
    return initEmscriptenModule(jxlEncoderMt);
  }
  return initEmscriptenModule(jxlEncoder);
}

export default async function encode(
  data: ImageData,
  options: EncodeOptions,
): Promise<ArrayBuffer> {
  if (!emscriptenModule) emscriptenModule = init();

  const module = await emscriptenModule;
  const result = module.encode(data.data, data.width, data.height, options);

  if (!result) throw new Error('Encoding error.');

  return result.buffer;
}
