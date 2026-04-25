import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const defaultProps = (size: number = 20): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconHome = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-2 0h2" />
  </svg>
);

export const IconCheckSquare = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

export const IconCalendar = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const IconFileText = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

export const IconCpu = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

export const IconMessageCircle = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
);

export const IconSettings = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export const IconPlus = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const IconSearch = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const IconSun = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

export const IconMoon = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

export const IconSend = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22,2 15,22 11,13 2,9" />
  </svg>
);

export const IconX = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const IconCheck = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

export const IconChevronDown = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

export const IconUpload = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17,8 12,3 7,8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const IconTrash = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

export const IconEdit = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const IconLogOut = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const IconExternalLink = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15,3 21,3 21,9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const IconClock = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

export const IconBook = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

export const IconLink = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

export const IconBold = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
    <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
  </svg>
);

export const IconItalic = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

export const IconUnderline = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" />
    <line x1="4" y1="21" x2="20" y2="21" />
  </svg>
);

export const IconList = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

export const IconCode = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <polyline points="16,18 22,12 16,6" />
    <polyline points="8,6 2,12 8,18" />
  </svg>
);

export const IconRefresh = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <polyline points="23,4 23,10 17,10" />
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
  </svg>
);

export const IconFilter = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
  </svg>
);

export const IconSort = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19,12 12,19 5,12" />
  </svg>
);

export const IconStar = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

export const IconGrid = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

export const IconUser = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const IconSparkle = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
  </svg>
);

export const IconCloud = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9Z" />
  </svg>
);

export const IconFolder = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);

export const IconArrowLeft = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const IconPaperclip = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);

export const IconPlayerPlay = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props} fill="currentColor">
    <path d="M8 5v14l11-7z" stroke="none" />
  </svg>
);

export const IconPlayerPause = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props} fill="currentColor">
    <rect x="6" y="4" width="4" height="16" stroke="none" />
    <rect x="14" y="4" width="4" height="16" stroke="none" />
  </svg>
);

export const IconBell = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

export const IconVolume = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
  </svg>
);

export const IconVolumeOff = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
  </svg>
);

export const IconMicrophone = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

export const IconBrain = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <path d="M9.5 2A5.5 5.5 0 004 7.5c0 1.33.47 2.55 1.26 3.5H5a4 4 0 00-1 7.89V19a3 3 0 003 3h1" />
    <path d="M14.5 2A5.5 5.5 0 0120 7.5c0 1.33-.47 2.55-1.26 3.5H19a4 4 0 011 7.89V19a3 3 0 01-3 3h-1" />
    <path d="M12 2v20" />
  </svg>
);

export const IconLayout = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

export const IconTarget = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const IconZap = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
  </svg>
);

export const IconShare2 = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const IconMenu = ({ size, ...props }: IconProps) => (
  <svg {...defaultProps(size)} {...props}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
