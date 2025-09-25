// 導出所有共享組件
export { UnifiedFooter, type FooterProps } from './components/UnifiedFooter';
export { UnifiedHeader, type HeaderProps } from './components/UnifiedHeader';
export { default as ModalProvider } from './components/ModalProvider';

// 重新導出為統一接口
export { UnifiedFooter as Footer } from './components/UnifiedFooter';
export { UnifiedHeader as Header } from './components/UnifiedHeader';
export { default as Modal } from './components/ModalProvider';
