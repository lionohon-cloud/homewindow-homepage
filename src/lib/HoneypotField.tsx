import { forwardRef } from 'react';

export const HoneypotField = forwardRef<HTMLInputElement>((_props, ref) => (
  <div
    aria-hidden="true"
    style={{
      position: 'absolute',
      left: '-9999px',
      top: '-9999px',
      width: 0,
      height: 0,
      overflow: 'hidden',
    }}
  >
    <label>
      웹사이트 주소 (비워두세요)
      <input
        ref={ref}
        type="text"
        name="hw_website"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </label>
  </div>
));
HoneypotField.displayName = 'HoneypotField';
