import * as React from 'react';
import Svg, {Path, Rect, SvgProps} from 'react-native-svg';

type ArrowRightProps = SvgProps & {
  color?: string;
  size?: number;
  thick?: boolean;
  leftDirection?: boolean;
};

export const ArrowRight = React.memo((props: ArrowRightProps) => {
  const {
    size = 24,
    color = 'black',
    thick = false,
    leftDirection = false,
  } = props;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        transform: leftDirection
          ? [{rotateY: '180deg'}, {translateX: size / 8}]
          : [],
      }}
      {...props}>
      <Rect
        x="8.70709"
        y="3.49023"
        width="12"
        height="1"
        rx="0.5"
        transform="rotate(45 8.70709 3.49023)"
        fill={color}
        stroke={thick ? color : undefined}
      />
      <Path
        d="M8.35361 20.1582C8.15835 19.963 8.15835 19.6464 8.35361 19.4511L16.1318 11.673C16.3271 11.4777 16.6436 11.4777 16.8389 11.673C17.0342 11.8682 17.0342 12.1848 16.8389 12.3801L9.06072 20.1582C8.86546 20.3535 8.54888 20.3535 8.35361 20.1582Z"
        fill={color}
        stroke={thick ? color : undefined}
      />
    </Svg>
  );
});
