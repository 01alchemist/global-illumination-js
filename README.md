### Global Illumination JS Summary

[![Build Status](https://travis-ci.org/01alchemist/global-illumination-js.png)](https://travis-ci.org/01alchemist/global-illumination-js)

I am a [Global Illumination](https://en.wikipedia.org/wiki/Global_illumination) renderer using [path tracing](http://en.wikipedia.org/wiki/Path_tracing) written in Typescript/Javascript.

Rendering algorithm is ported from [Go implementation](https://github.com/fogleman/pt) written by [Michael Fogleman](https://github.com/fogleman)

##Disclaimer: Currently it only works with Firefox Nightly since multi-threading relying on SharedArrayBuffer.  

### Features

* Supports OBJ
* Supports textures, bump maps and normal maps
* Uses k-d trees to accelerate ray intersection tests
* Supports various material properties
* Light sources with configurable attenuation
* Supports configurable depth of field
* Supports iterative rendering
* Uses all CPU cores in parallel

### TODO

Here are things that I'm planning, or at least hoping, to do.

* Shared scene
* Binary STL and ASCII STL Loader
* Subsurface scattering
* Atmosphere
* Constructive solid geometry
* Animation support?

### Links

Here are some resources that I have found useful.

* [WebGL Path Tracing - Evan Wallace](http://madebyevan.com/webgl-path-tracing/)
* [Global Illumination in a Nutshell](http://www.thepolygoners.com/tutorials/GIIntro/GIIntro.htm)
* [Simple Path Tracing - Iñigo Quilez](http://www.iquilezles.org/www/articles/simplepathtracing/simplepathtracing.htm)
* [Realistic Raytracing - Zack Waters](http://web.cs.wpi.edu/~emmanuel/courses/cs563/write_ups/zackw/realistic_raytracing.html)
* [Reflections and Refractions in Ray Tracing - Bram de Greve](http://graphics.stanford.edu/courses/cs148-10-summer/docs/2006--degreve--reflection_refraction.pdf)
* [Better Sampling - Rory Driscoll](http://www.rorydriscoll.com/2009/01/07/better-sampling/)
* [Ray Tracing for Global Illumination - Nelson Max at UC Davis](https://www.youtube.com/playlist?list=PLslgisHe5tBPckSYyKoU3jEA4bqiFmNBJ)
* [Physically Based Rendering - Matt Pharr, Greg Humphreys](http://www.amazon.com/Physically-Based-Rendering-Second-Edition/dp/0123750792)

### Samples

