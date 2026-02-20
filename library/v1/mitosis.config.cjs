/**
 * @type {import('@builder.io/mitosis').MitosisConfig}
 */
module.exports = {
  "files": "src/**",
  "targets": [
    "react",
    "svelte",
    "qwik",
    "rsc",
    "vue",
    "angular",
    "webcomponent",
    "solid",
    "preact"
  ],
  "dest": "packages",
  "commonOptions": {
    "typescript": true
  },
  "options": {
    "react": {
      "stylesType": "style-tag"
    },
    "svelte": {},
    "qwik": {},
    "rsc":{},
    "vue": {},
    "angular": {},
    "webcomponent": {},
    "customElement": {},
    "solid": {}
  }
}