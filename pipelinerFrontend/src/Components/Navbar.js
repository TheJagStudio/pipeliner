import React, { useState, useEffect } from "react";

const Navbar = () => {
    const [system, setSystem] = useState({ ram: 15, cpu: 15, vram: 15 });
    useEffect(() => {
        let systemInterval = setInterval(() => {
            fetch(process.env.REACT_APP_SERVER + "/api/sysInfo/")
                .then((res) => res.json())
                .then((data) => {
                    setSystem(data);
                })
                .catch((err) => console.log(err));
        }, 20000);
    }, []);
    return (
        <div>
            <header className="flex justify-between h-14 items-center px-4 py-2 bg-primary-900">
                <div className="flex flex-nowrap items-center justify-between">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            transform: "none",
                            transformOrigin: "50% 50%",
                            cursor: "move",
                        }}
                        width={30}
                        height={30}
                        viewBox="0 0 7030 8600"
                        className="text-white"
                    >
                        <g fill="currentColor">
                            <g>
                                <path id="p3Lh8sS1f" d="M350 8136 c0 -148 -1 -146 68 -167 30 -9 47 -20 53 -37 14 -36 12 -4439 -2 -4448 -6 -4 -35 -12 -63 -18 l-51 -11 0 -150 0 -150 905 4 c498 2 908 6 912 10 4 4 12 63 17 131 11 146 9 150 -79 172 l-55 14 -7 675 c-4 371 -4 1367 -1 2214 l6 1539 21 18 c12 9 33 20 49 23 52 12 57 25 57 164 0 85 -4 131 -12 139 -9 9 -226 12 -915 12 l-903 0 0 -134z m601 -212 c10 -13 13 -424 17 -2213 4 -2015 3 -2198 -12 -2210 -17 -14 -119 -12 -133 3 -9 9 -7 4377 2 4405 6 19 23 24 91 29 12 1 27 -5 35 -14z" />
                                <path id="pk8WxuEtA" d="M2395 5853 c-22 -3 -43 -10 -47 -16 -9 -15 -11 -1685 -2 -1751 l7 -47 141 3 140 3 17 45 17 45 243 8 c134 4 451 6 704 5 l460 -3 95 -33 c253 -88 432 -222 610 -456 132 -176 220 -443 221 -672 0 -130 -52 -354 -111 -481 -117 -251 -305 -444 -550 -568 -206 -103 -272 -115 -692 -122 l-338 -6 0 33 c0 23 -9 41 -34 66 l-34 34 -125 0 c-69 0 -128 -4 -131 -8 -3 -5 -8 -411 -12 -904 l-7 -895 39 -7 c21 -4 86 -9 144 -13 122 -6 135 0 148 78 l8 44 409 6 c443 6 498 11 711 64 336 83 680 235 934 413 198 138 489 408 619 572 61 77 181 245 181 254 0 2 23 43 51 92 178 308 288 641 339 1029 40 297 13 721 -62 990 -54 197 -154 453 -222 573 -20 35 -36 66 -36 68 0 2 -28 50 -61 106 -88 147 -208 303 -353 459 -155 167 -276 271 -446 384 -25 16 -61 42 -80 57 -57 44 -282 160 -390 202 -36 13 -83 32 -105 42 -69 30 -168 65 -215 75 -25 5 -61 15 -80 23 -69 27 -365 75 -530 85 -91 6 -413 11 -716 11 l-551 0 -52 60 -52 60 -82 -2 c-45 -1 -100 -3 -122 -5z m1488 -1232 c11 -8 17 -28 17 -52 0 -73 25 -70 -625 -70 -318 0 -580 3 -584 6 -3 4 -6 29 -6 57 0 84 -39 79 611 76 466 -2 574 -6 587 -17z m2302 -1557 c76 -30 55 -373 -47 -754 -86 -321 -238 -603 -489 -904 -350 -419 -914 -726 -1490 -810 -122 -18 -324 -21 -366 -5 -34 13 -43 25 -43 66 0 49 21 63 96 63 87 0 318 26 443 50 183 35 314 82 556 200 359 176 696 484 904 828 213 353 310 681 345 1166 7 91 34 121 91 100z" />
                                <path id="p17OitDAFm" d="M803 2982 c-420 -2 -433 -3 -443 -22 -6 -12 -9 -68 -8 -137 l3 -118 60 -31 60 -30 6 -700 5 -699 31 -115 c69 -252 187 -455 346 -592 166 -142 355 -236 555 -275 71 -14 177 -18 572 -22 l485 -6 5 -55 5 -55 150 -5 c125 -5 152 -3 163 9 10 12 12 199 10 907 -2 491 -7 896 -11 900 -14 14 -148 17 -218 4 -72 -12 -87 -23 -115 -85 -23 -48 -39 -52 -98 -26 -25 12 -49 21 -54 21 -17 0 -139 98 -181 146 -66 75 -72 109 -69 399 l3 249 55 22 c51 20 56 25 62 60 3 22 4 87 1 146 l-6 108 -471 2 c-259 2 -665 2 -903 0z m145 -1529 c5 -10 12 -47 16 -83 11 -101 34 -176 88 -287 42 -88 60 -112 123 -171 122 -114 261 -175 427 -187 115 -9 127 -16 109 -75 -19 -62 -45 -74 -149 -65 -193 16 -318 67 -440 181 -154 143 -234 274 -272 449 -39 181 -39 223 2 243 36 17 86 14 96 -5z" />
                            </g>
                        </g>
                    </svg>
                    <h1 className="text-2xl text-white font-bold capitalize font-mono">IPELINER</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 group rounded-full flex items-center justify-center relative" style={{ background: "conic-gradient(var(--primary-500) " + system["cpu"] * 3.6 + "deg,var(--primary-800) " + system["cpu"] * 3.6 + "deg)" }}>
                        <div className="h-8 w-8 rounded-full bg-primary-900 text-white p-2 text-xs flex item-center justify-center">CPU</div>
                        <div className="absolute scale-y-0 group-hover:scale-y-100 origin-top text-sm text-white top-14 bg-primary-800 w-max rounded-md px-2 transition-all">CPU usage : {system["cpu"]}%</div>
                    </div>
                    <div className="h-10 w-10 group rounded-full flex items-center justify-center relative" style={{ background: "conic-gradient(var(--primary-500) " + system["ram"] * 3.6 + "deg,var(--primary-800) " + system["ram"] * 3.6 + "deg)" }}>
                        <div className="h-8 w-8 rounded-full bg-primary-900 text-white p-2 text-xs flex item-center justify-center">RAM</div>
                        <div className="absolute scale-y-0 group-hover:scale-y-100 origin-top text-sm text-white top-14 bg-primary-800 w-max rounded-md px-2 transition-all">RAM usage : {system["ram"]}%</div>
                    </div>
                    <div className="h-10 w-10 group rounded-full flex items-center justify-center relative" style={{ background: "conic-gradient(var(--primary-500) " + system["vram"] * 3.6 + "deg,var(--primary-800) " + system["vram"] * 3.6 + "deg)" }}>
                        <div className="h-8 w-8 rounded-full bg-primary-900 text-white p-2 text-xs flex item-center justify-center">VRAM</div>
                        <div className="absolute scale-y-0 group-hover:scale-y-100 origin-top text-sm text-white top-14 bg-primary-800 w-max rounded-md px-2 transition-all -translate-x-1/2">VRAM usage : {system["vram"]}%</div>
                    </div>
                </div>
            </header>
            <div className="flex px-2 gap-2 noScroll flex-nowrap overflow-x-scroll items-center h-fit py-1 w-full mt-2 drop-shadow-lg">
                <div className={(window.location.pathname === "/" ? "bg-primary-600 hover:bg-primary-50 text-white hover:text-primary-800" : "text-primary-500") + " border-2 border-primary-800 transition-all duration-300 rounded-full px-4"}>
                    <a href="/" className="text-xl font-mono my-0.5 whitespace-nowrap">
                        Fabric Registration
                    </a>
                </div>
                <div className={(window.location.pathname === "/annotator-allocation" ? "bg-primary-600 hover:bg-primary-50 text-white hover:text-primary-800" : "text-primary-500") + " border-2 border-primary-800 transition-all duration-300 rounded-full px-4"}>
                    <a href="/annotator-allocation" className="text-xl font-mono my-0.5 whitespace-nowrap">
                        Annotator Allocation
                    </a>
                </div>
                <div className={(window.location.pathname === "/image-annotation" ? "bg-primary-600 hover:bg-primary-50 text-white hover:text-primary-800" : "text-primary-500") + " border-2 border-primary-800 transition-all duration-300 rounded-full px-4"}>
                    <a href="/image-annotation" className="text-xl font-mono my-0.5 whitespace-nowrap">
                        Image Annotation
                    </a>
                </div>
                <div className={(window.location.pathname === "/image-gallery" ? "bg-primary-600 hover:bg-primary-50 text-white hover:text-primary-800" : "text-primary-500") + " border-2 border-primary-800 transition-all duration-300 rounded-full px-4"}>
                    <a href="/image-gallery" className="text-xl font-mono my-0.5 whitespace-nowrap">
                        Image Gallery
                    </a>
                </div>
                {/* <div className={(window.location.pathname === "/train" ? "bg-primary-600 hover:bg-primary-50 text-white hover:text-primary-800" : "text-primary-500") + " border-2 border-primary-800 transition-all duration-300 rounded-full px-4"}>
                    <a href="/train" className="text-xl font-mono my-0.5 whitespace-nowrap">
                        Training Pipeline
                    </a>
                </div>
                <div className={(window.location.pathname === "/prediction" ? "bg-primary-600 hover:bg-primary-50 text-white hover:text-primary-800" : "text-primary-500") + " border-2 border-primary-800 transition-all duration-300 rounded-full px-4"}>
                    <a href="/prediction" className="text-xl font-mono my-0.5 whitespace-nowrap">
                        Prediction Pipeline
                    </a>
                </div> */}

                {/* <div className={(window.location.pathname === "/text" ? "bg-primary-700 hover:bg-primary-600 text-white" : "text-primary-700") + " border-2 border-primary-700 transition-all duration-300 rounded-full px-4"}>
					<a href="/text" className="text-xl font-mono my-0.5 whitespace-nowrap">
						Text Anotator
					</a>
				</div> */}
            </div>
        </div>
    );
};

export default Navbar;
