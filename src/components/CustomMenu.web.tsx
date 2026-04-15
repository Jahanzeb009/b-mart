import React, { forwardRef } from "react";

type MenuAction = {
  id: string;
  title: string;
};

type Props = {
  data: MenuAction[];
  title?: string;
  onValueSelect?: (value: string) => void;
  children: React.ReactNode;
};

const MenuItem = forwardRef<HTMLSelectElement, Props>(
  ({ title, data, onValueSelect, children }, ref) => {
    return (
      <div style={{ display: "inline-block", position: "relative" }}>
        {children}
        <select
          ref={ref}
          aria-label={title}
          onChange={(e) => onValueSelect?.(e.target.value)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
          }}
        >
          <option value="" hidden>
            {title || "Select"}
          </option>
          {data.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

export default MenuItem;
