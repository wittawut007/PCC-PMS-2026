import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "calendar-date": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: string;
        min?: string;
        max?: string;
        locale?: string;
        class?: string;
        showOutsideDays?: boolean;
        firstDayOfWeek?: number;
      };
      "calendar-month": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "calendar-range": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: string;
        min?: string;
        max?: string;
        locale?: string;
        class?: string;
      };
      "calendar-multi": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: string;
        min?: string;
        max?: string;
        locale?: string;
        class?: string;
      };
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "calendar-date": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: string;
        min?: string;
        max?: string;
        locale?: string;
        class?: string;
        showOutsideDays?: boolean;
        firstDayOfWeek?: number;
      };
      "calendar-month": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "calendar-range": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: string;
        min?: string;
        max?: string;
        locale?: string;
        class?: string;
      };
      "calendar-multi": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: string;
        min?: string;
        max?: string;
        locale?: string;
        class?: string;
      };
    }
  }
}
