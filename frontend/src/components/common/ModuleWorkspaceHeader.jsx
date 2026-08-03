import React from 'react';

export default function ModuleWorkspaceHeader({
  title,
  description,
  icon: Icon,
  actions,
  titleColor = "text-yellow-600",
  iconColor = "text-yellow-600",
  titleSize = "text-4xl",
  fontWeight = "font-black",
  letterSpacing = "tracking-wide",
  bgGradient = "from-slate-900 to-slate-900",
  bgBorder = "border-b border-slate-800",
  textShadow = "",
  textStroke = "0.4px #1e293b"
}) {
  const headerStyle = {};
  if (textShadow) headerStyle.textShadow = textShadow;
  if (textStroke) {
    headerStyle.WebkitTextStroke = textStroke;
    headerStyle.paintOrder = "stroke fill";
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6">
      <div className={`h-16 bg-gradient-to-r ${bgGradient} ${bgBorder} relative rounded-t-2xl`}></div>
      <div className="px-6 pb-6 relative">
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-8">
          <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-md">
            <div className={`w-full h-full rounded-xl bg-slate-100 flex items-center justify-center ${iconColor}`}>
              {Icon && <Icon size={28} />}
            </div>
          </div>
          <div className="flex-1 pb-1">
            <h1
              className={`${letterSpacing} ${titleSize} ${titleColor} ${fontWeight}`}
              style={headerStyle}
            >
              {title}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">{description}</p>
          </div>
          {actions && (
            <div className="flex items-center gap-2 pb-1">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
