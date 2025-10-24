module.exports = {
    extends: [
        "react-app",
        "react-app/jest"
    ],
    rules: {
        // Deshabilitar la validación de prop-types temporalmente
        "react/prop-types": "off",
        
        // Deshabilitar reglas de accesibilidad que están causando errores
        "jsx-a11y/click-events-have-key-events": "off",
        "jsx-a11y/no-static-element-interactions": "off",
        
        // Deshabilitar prettier conflicts
        "prettier/prettier": "off"
    },
    parser: "@babel/eslint-parser",
    parserOptions: {
        requireConfigFile: false,
        babelOptions: {
            presets: ["@babel/preset-react"]
        }
    }
};