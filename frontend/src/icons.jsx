// Thin wrappers around lucide for inline SVG icons.
// Usage: <Icon name="zap" className="w-4 h-4" />
const Icon = ({ name, className = 'w-4 h-4', strokeWidth = 1.75, style }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current && window.lucide) {
      ref.current.innerHTML = '';
      const svg = window.lucide.createElement(window.lucide.icons[toPascal(name)] || window.lucide.icons.Circle);
      svg.setAttribute('stroke-width', strokeWidth);
      svg.setAttribute('class', '');
      ref.current.appendChild(svg);
    }
  }, [name, strokeWidth]);
  return <span ref={ref} className={`inline-flex items-center justify-center ${className}`} style={style} />;
};

function toPascal(name) {
  return name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

window.Icon = Icon;
