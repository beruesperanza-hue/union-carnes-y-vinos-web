import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#17130F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
        }}
      >
        <span
          style={{
            fontSize: 40,
            fontWeight: 900,
            color: '#F3E7CE',
            fontFamily: 'sans-serif',
          }}
        >
          U
        </span>
      </div>
    ),
    { ...size }
  );
}
