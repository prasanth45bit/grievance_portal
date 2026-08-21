/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-container": "#eeedf2",
        "surface-bright": "#f9f9fe",
        "tertiary-fixed": "#8dfc75",
        "on-primary-fixed-variant": "#1f477b",
        "on-tertiary-fixed": "#012200",
        "surface-container-low": "#f4f3f8",
        "inverse-primary": "#a7c8ff",
        "primary-fixed-dim": "#a7c8ff",
        "secondary-fixed-dim": "#ffb77a",
        "inverse-on-surface": "#f1f0f5",
        "outline": "#737780",
        "on-secondary-container": "#683700",
        "surface-tint": "#3a5f94",
        "on-error": "#ffffff",
        "on-primary-container": "#799dd6",
        "on-primary": "#ffffff",
        "on-background": "#1a1c1f",
        "surface-container-high": "#e8e8ed",
        "secondary-fixed": "#ffdcc2",
        "on-primary-fixed": "#001b3c",
        "surface": "#f9f9fe",
        "surface-dim": "#dad9de",
        "on-surface-variant": "#43474f",
        "on-error-container": "#93000a",
        "inverse-surface": "#2f3034",
        "surface-container-lowest": "#ffffff",
        "primary-fixed": "#d5e3ff",
        "on-surface": "#1a1c1f",
        "on-secondary-fixed": "#2e1500",
        "outline-variant": "#c3c6d1",
        "primary-container": "#003366",
        "secondary-container": "#fe9832",
        "tertiary-fixed-dim": "#72de5c",
        "on-tertiary-container": "#46b135",
        "on-tertiary-fixed-variant": "#035300",
        "secondary": "#8f4e00",
        "on-tertiary": "#ffffff",
        "background": "#f9f9fe",
        "primary": "#001e40",
        "tertiary-container": "#023d00",
        "error-container": "#ffdad6",
        "on-secondary": "#ffffff",
        "surface-container-highest": "#e2e2e7",
        "error": "#ba1a1a",
        "surface-variant": "#e2e2e7",
        "tertiary": "#012500",
        "on-secondary-fixed-variant": "#6d3a00"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "container-max": "1280px",
        "md": "24px",
        "lg": "32px",
        "gutter": "24px",
        "base": "4px",
        "margin-desktop": "32px",
        "xl": "48px",
        "sm": "16px",
        "xs": "8px",
        "margin-mobile": "16px"
      },
      fontFamily: {
        "title-lg": ["Inter"],
        "display-lg": ["Inter"],
        "body-md": ["Inter"],
        "headline-md": ["Inter"],
        "body-lg": ["Inter"],
        "headline-lg": ["Inter"],
        "label-md": ["Inter"],
        "label-sm": ["Inter"],
        "headline-lg-mobile": ["Inter"]
      },
      fontSize: {
        "title-lg": [
          "20px",
          {
            "lineHeight": "28px",
            "fontWeight": "600"
          }
        ],
        "display-lg": [
          "48px",
          {
            "lineHeight": "56px",
            "letterSpacing": "-0.02em",
            "fontWeight": "700"
          }
        ],
        "body-md": [
          "16px",
          {
            "lineHeight": "24px",
            "fontWeight": "400"
          }
        ],
        "headline-md": [
          "24px",
          {
            "lineHeight": "32px",
            "fontWeight": "600"
          }
        ],
        "body-lg": [
          "18px",
          {
            "lineHeight": "28px",
            "fontWeight": "400"
          }
        ],
        "headline-lg": [
          "32px",
          {
            "lineHeight": "40px",
            "letterSpacing": "-0.01em",
            "fontWeight": "700"
          }
        ],
        "label-md": [
          "14px",
          {
            "lineHeight": "20px",
            "letterSpacing": "0.01em",
            "fontWeight": "500"
          }
        ],
        "label-sm": [
          "12px",
          {
            "lineHeight": "16px",
            "letterSpacing": "0.02em",
            "fontWeight": "500"
          }
        ],
        "headline-lg-mobile": [
          "24px",
          {
            "lineHeight": "32px",
            "fontWeight": "700"
          }
        ]
      }
    }
  },
  plugins: [],
}
