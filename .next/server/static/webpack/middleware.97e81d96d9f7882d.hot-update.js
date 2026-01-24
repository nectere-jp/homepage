"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("middleware",{

/***/ "(middleware)/./lib/i18n.ts":
/*!*********************!*\
  !*** ./lib/i18n.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   locales: () => (/* binding */ locales)\n/* harmony export */ });\n/* harmony import */ var next_intl_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-intl/server */ \"(middleware)/./node_modules/next-intl/dist/development/server.react-client.js\");\n/* harmony import */ var next_navigation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/navigation */ \"(middleware)/./node_modules/next/dist/esm/api/navigation.js\");\n\n\nconst locales = [\n    \"ja\",\n    \"en\"\n];\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_intl_server__WEBPACK_IMPORTED_MODULE_1__.getRequestConfig)(async ({ requestLocale })=>{\n    const locale = await requestLocale;\n    if (!locale || !locales.includes(locale)) {\n        (0,next_navigation__WEBPACK_IMPORTED_MODULE_0__.notFound)();\n    }\n    return {\n        locale,\n        messages: (await __webpack_require__(\"(middleware)/./messages lazy recursive ^\\\\.\\\\/.*\\\\.json$\")(`./${locale}.json`)).default\n    };\n}));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vbGliL2kxOG4udHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFvRDtBQUNUO0FBR3BDLE1BQU1FLFVBQVU7SUFBQztJQUFNO0NBQUssQ0FBVTtBQUc3QyxpRUFBZUYsa0VBQWdCQSxDQUFDLE9BQU8sRUFBRUcsYUFBYSxFQUFFO0lBQ3RELE1BQU1DLFNBQVMsTUFBTUQ7SUFFckIsSUFBSSxDQUFDQyxVQUFVLENBQUNGLFFBQVFHLFFBQVEsQ0FBQ0QsU0FBbUI7UUFDbERILHlEQUFRQTtJQUNWO0lBRUEsT0FBTztRQUNMRztRQUNBRSxVQUFVLENBQUMsTUFBTSxnRkFBTyxHQUFhLEVBQUVGLE9BQU8sTUFBTSxHQUFHRyxPQUFPO0lBQ2hFO0FBQ0YsRUFBRSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vX05fRS8uL2xpYi9pMThuLnRzPzQ5YWUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0UmVxdWVzdENvbmZpZyB9IGZyb20gJ25leHQtaW50bC9zZXJ2ZXInO1xuaW1wb3J0IHsgbm90Rm91bmQgfSBmcm9tICduZXh0L25hdmlnYXRpb24nO1xuaW1wb3J0IHsgZ2V0UmVxdWVzdENvbmZpZyBhcyBnZXRSZXF1ZXN0TG9jYWxlIH0gZnJvbSAnbmV4dC1pbnRsL3NlcnZlcic7XG5cbmV4cG9ydCBjb25zdCBsb2NhbGVzID0gWydqYScsICdlbiddIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgTG9jYWxlID0gKHR5cGVvZiBsb2NhbGVzKVtudW1iZXJdO1xuXG5leHBvcnQgZGVmYXVsdCBnZXRSZXF1ZXN0Q29uZmlnKGFzeW5jICh7IHJlcXVlc3RMb2NhbGUgfSkgPT4ge1xuICBjb25zdCBsb2NhbGUgPSBhd2FpdCByZXF1ZXN0TG9jYWxlO1xuICBcbiAgaWYgKCFsb2NhbGUgfHwgIWxvY2FsZXMuaW5jbHVkZXMobG9jYWxlIGFzIExvY2FsZSkpIHtcbiAgICBub3RGb3VuZCgpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBsb2NhbGUsXG4gICAgbWVzc2FnZXM6IChhd2FpdCBpbXBvcnQoYC4uL21lc3NhZ2VzLyR7bG9jYWxlfS5qc29uYCkpLmRlZmF1bHQsXG4gIH07XG59KTtcbiJdLCJuYW1lcyI6WyJnZXRSZXF1ZXN0Q29uZmlnIiwibm90Rm91bmQiLCJsb2NhbGVzIiwicmVxdWVzdExvY2FsZSIsImxvY2FsZSIsImluY2x1ZGVzIiwibWVzc2FnZXMiLCJkZWZhdWx0Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(middleware)/./lib/i18n.ts\n");

/***/ })

});