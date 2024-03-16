import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

export default function InViewElement({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const [ref, inView] = useInView();
  const wrapperElemenRef = useRef<HTMLDivElement>();
  const refCallback = useCallback(
    (node: HTMLDivElement) => {
      ref(node);
      wrapperElemenRef.current = node;
    },
    [ref],
  );
  const [load, setLoad] = useState(inView);

  useEffect(() => {
    if (!wrapperElemenRef.current) {
      return;
    }
    if (load && !inView) {
      const height = wrapperElemenRef.current?.clientHeight;
      if (height && wrapperElemenRef.current) {
        wrapperElemenRef.current.style.minHeight = `${height}px`;
      }
    }
    setLoad(inView);
  }, [inView, load, setLoad]);

  return (
    <div className={className} ref={refCallback}>
      {load && children}
    </div>
  );
}
