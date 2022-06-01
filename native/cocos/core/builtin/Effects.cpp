/****************************************************************************
 Copyright (c) 2021 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
****************************************************************************/

// clang-format off
#include "core/builtin/Effects.h"
#include "base/StringUtil.h"
namespace cc {

// absolute essential effects
const GzipedString BUILTIN_EFFECTS { 
"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"
};
} // namespace cc
