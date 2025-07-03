import * as React from "react";

export function Avatar({ children, ...props }: React.ComponentProps<"span">) {
    return (
        <span className="inline-block rounded-full overflow-hidden bg-muted" {...props}>
      {children}
    </span>
    );
}