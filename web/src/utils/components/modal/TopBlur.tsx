export default function TopBlur() {
  return (
    <div
      className="absolute z-[50] left-0 top-0 w-full h-(--modalFadeHeight) backdrop-blur-[1px]
      [mask-image:linear-gradient(to_bottom,black_0%,black_60%,transparent_100%)]
      [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_60%,transparent_100%)]"
      aria-hidden
    />
  );
}
