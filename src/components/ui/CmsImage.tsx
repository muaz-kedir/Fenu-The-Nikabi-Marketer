import React, { useState, useEffect } from 'react';
import { resolveImageUrl } from '../../utils/imageUrl';

export interface CmsImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
  alt: string;
}

export const CmsImage: React.FC<CmsImageProps> = ({
  src,
  fallbackSrc = '/fenu-brand.png',
  alt,
  className,
  onError,
  loading = 'lazy',
  ...props
}) => {
  const initialResolved = resolveImageUrl(src, fallbackSrc);
  const [currentSrc, setCurrentSrc] = useState(initialResolved);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const nextResolved = resolveImageUrl(src, fallbackSrc);
    setCurrentSrc(nextResolved);
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
    onError?.(e);
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading={loading}
      {...props}
    />
  );
};

export default CmsImage;
