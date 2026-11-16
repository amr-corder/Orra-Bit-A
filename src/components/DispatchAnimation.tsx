import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Language } from '../utils/i18n';

interface DispatchAnimationProps {
  orderNumber: string;
  language: Language;
  onComplete: () => void;
}

type DispatchStage = 'loading' | 'boarding' | 'driving';

export const DispatchAnimation: React.FC<DispatchAnimationProps> = ({
  orderNumber,
  language,
  onComplete
}) => {
  const [stage, setStage] = useState<DispatchStage>('loading');
  const isAr = language === 'ar';
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const t1 = setTimeout(() => setStage('boarding'), 1450);
    const t2 = setTimeout(() => setStage('driving'), 2450);
    const t3 = setTimeout(() => onCompleteRef.current(), 3950);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const stageLabels: Record<DispatchStage, { title: string; sub: string }> = isAr
    ? {
        loading: {
          title: 'جاري تجهيز وتحميل الطلب في سيارة التوصيل...',
          sub: 'تغليف فائق العناية من أتيليه ORRA BIT'
        },
        boarding: {
          title: 'المندوب يستعد للانطلاق بالطلب...',
          sub: 'تم تأمين الشحنة بنجاح'
        },
        driving: {
          title: 'انطلق الطلب في طريقه إليك!',
          sub: `رقم الشحنة ${orderNumber}`
        }
      }
    : {
        loading: {
          title: 'Loading your order into the dispatch vehicle...',
          sub: 'Carefully packed at the ORRA BIT Atelier'
        },
        boarding: {
          title: 'Courier boarding & securing dispatch...',
          sub: 'Parcel locked inside compartment'
        },
        driving: {
          title: 'Dispatched — On the way to you!',
          sub: `Shipment ${orderNumber}`
        }
      };

  const progressWidth =
    stage === 'loading' ? '33%' : stage === 'boarding' ? '68%' : '100%';

  return (
    <div className="p-6 sm:p-10 md:p-12 text-center max-w-2xl mx-auto space-y-6">
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#71717A] block">
          {isAr ? 'تأكيد الشحن // ORRA BIT COURIER' : 'DISPATCH CONFIRMATION // ORRA BIT COURIER'}
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#0A0A0A]">
          {stageLabels[stage].title}
        </h2>
        <p className="text-[12px] font-mono text-[#71717A]">
          {stageLabels[stage].sub}
        </p>
      </div>

      {/* Architectural Vector Scene (always LTR so vehicle drives left -> right) */}
      <div
        dir="ltr"
        className="relative w-full bg-[#FAFAFA] border border-[#E4E4E7] overflow-hidden"
      >
        <svg
          viewBox="0 0 460 185"
          className="w-full h-auto block select-none"
          role="img"
          aria-label="Order loading and courier dispatch animation"
        >
          <defs>
            <linearGradient id="headlightBeam" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#FACC15" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Subtle Atelier Silhouette on Far Left */}
          <g opacity="0.22">
            <rect x="24" y="64" width="54" height="84" fill="none" stroke="#0A0A0A" strokeWidth="1.2" />
            <rect x="34" y="80" width="34" height="24" fill="none" stroke="#0A0A0A" strokeWidth="1" />
            <rect x="42" y="114" width="18" height="34" fill="none" stroke="#0A0A0A" strokeWidth="1" />
            <text
              x="51"
              y="74"
              textAnchor="middle"
              fontSize="5.5"
              fontFamily="monospace"
              fill="#0A0A0A"
              letterSpacing="1"
            >
              ATELIER
            </text>
          </g>

          {/* Road Surface & Moving Lane Markers */}
          <line x1="0" y1="148" x2="460" y2="148" stroke="#0A0A0A" strokeWidth="1.6" />
          <motion.g
            animate={stage === 'driving' ? { x: [0, -120] } : { x: 0 }}
            transition={
              stage === 'driving'
                ? { duration: 0.7, repeat: Infinity, ease: 'linear' }
                : { duration: 0.2 }
            }
          >
            {[15, 65, 115, 165, 215, 265, 315, 365, 415, 465, 515, 565].map((xPos) => (
              <line
                key={xPos}
                x1={xPos}
                y1="160"
                x2={xPos + 24}
                y2="160"
                stroke="#D4D4D8"
                strokeWidth="2"
              />
            ))}
          </motion.g>

          {/* Courier Person (Walks to Van -> Loads Parcel -> Walks to Cab -> Enters) */}
          <motion.g
            initial={{ x: 0, opacity: 1 }}
            animate={
              stage === 'loading'
                ? { x: [0, 74, 74], opacity: 1 }
                : stage === 'boarding'
                ? { x: [74, 206, 216], opacity: [1, 1, 0] }
                : { x: 216, opacity: 0 }
            }
            transition={{
              duration: stage === 'loading' ? 1.3 : 0.85,
              times: stage === 'loading' ? [0, 0.58, 1] : [0, 0.75, 1],
              ease: 'easeInOut'
            }}
          >
            {/* Head + Courier Cap */}
            <circle cx="96" cy="92" r="7" fill="#0A0A0A" />
            <path d="M89 90 L105 90 L107 92 L95 92 Z" fill="#0A0A0A" />

            {/* Torso */}
            <rect x="90" y="100" width="12" height="24" rx="2" fill="#0A0A0A" />

            {/* Walking Legs */}
            <motion.line
              x1="94"
              y1="124"
              x2="90"
              y2="147"
              stroke="#0A0A0A"
              strokeWidth="3.2"
              strokeLinecap="round"
              animate={{
                x2: stage === 'loading' ? [90, 98, 92] : [92, 88, 96, 92]
              }}
              transition={{ duration: 0.45, repeat: stage === 'boarding' ? 2 : 1 }}
            />
            <motion.line
              x1="98"
              y1="124"
              x2="103"
              y2="147"
              stroke="#0A0A0A"
              strokeWidth="3.2"
              strokeLinecap="round"
              animate={{
                x2: stage === 'loading' ? [103, 94, 100] : [100, 106, 97, 100]
              }}
              transition={{ duration: 0.45, repeat: stage === 'boarding' ? 2 : 1 }}
            />

            {/* Arms reaching forward */}
            <motion.path
              d="M99 105 L114 108"
              stroke="#0A0A0A"
              strokeWidth="3"
              strokeLinecap="round"
              animate={
                stage === 'loading'
                  ? { d: ['M99 105 L114 108', 'M99 105 L115 104', 'M99 105 L121 97'] }
                  : { d: 'M99 105 L106 116' }
              }
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />

            {/* Parcel Box held by courier and placed inside van during Stage 1 */}
            {stage === 'loading' && (
              <motion.g
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: [0, 0, 34, 42],
                  y: [0, -3, -11, -9],
                  opacity: [1, 1, 1, 0],
                  scale: [1, 1, 0.96, 0.85]
                }}
                transition={{ duration: 1.35, times: [0, 0.52, 0.84, 1], ease: 'easeInOut' }}
              >
                <rect
                  x="110"
                  y="95"
                  width="22"
                  height="18"
                  fill="#FFFFFF"
                  stroke="#0A0A0A"
                  strokeWidth="1.8"
                />
                <line x1="110" y1="101" x2="132" y2="101" stroke="#0A0A0A" strokeWidth="1.2" />
                <line x1="121" y1="95" x2="121" y2="113" stroke="#0A0A0A" strokeWidth="1.2" />
                <circle cx="121" cy="101" r="1.5" fill="#22C55E" />
              </motion.g>
            )}
          </motion.g>

          {/* Delivery Van Group (Stationary -> Engine Bounce -> Drives Off Right) */}
          <motion.g
            initial={{ x: 0, y: 0 }}
            animate={
              stage === 'loading'
                ? { x: 0, y: 0 }
                : stage === 'boarding'
                ? { x: 0, y: [0, 1.5, 0] }
                : { x: [0, -4, 300], y: [0, 0, -0.5, 0] }
            }
            transition={
              stage === 'driving'
                ? {
                    x: { duration: 1.45, times: [0, 0.08, 1], ease: [0.42, 0, 0.9, 1] },
                    y: { duration: 0.25, repeat: 5 }
                  }
                : { duration: 0.45, delay: stage === 'boarding' ? 0.55 : 0 }
            }
          >
            {/* Speed Wind Lines & Exhaust Puff while Driving */}
            {stage === 'driving' && (
              <g>
                <motion.line
                  x1="154"
                  y1="86"
                  x2="184"
                  y2="86"
                  stroke="#A1A1AA"
                  strokeWidth="1.4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: [0, 0.9, 0], x: [-12, -34] }}
                  transition={{ duration: 0.45, repeat: Infinity }}
                />
                <motion.line
                  x1="145"
                  y1="104"
                  x2="180"
                  y2="104"
                  stroke="#A1A1AA"
                  strokeWidth="1.4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: [0, 0.85, 0], x: [-8, -36] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.12 }}
                />
                <motion.circle
                  cx="185"
                  cy="132"
                  r="4"
                  fill="#E4E4E7"
                  animate={{ cx: [185, 165], r: [3, 7], opacity: [0.8, 0] }}
                  transition={{ duration: 0.55, repeat: Infinity }}
                />
              </g>
            )}

            {/* Headlight Beam (Ignites in Boarding & Stays On while Driving) */}
            {(stage === 'boarding' || stage === 'driving') && (
              <motion.polygon
                points="349,115 415,103 415,131 349,122"
                fill="url(#headlightBeam)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, delay: stage === 'boarding' ? 0.55 : 0 }}
              />
            )}

            {/* Open Cargo Interior Shadow during Stage 1 */}
            <rect x="195" y="71" width="10" height="60" fill="#E4E4E7" />

            {/* Main Cargo Box */}
            <rect
              x="196"
              y="68"
              width="102"
              height="66"
              fill="#FFFFFF"
              stroke="#0A0A0A"
              strokeWidth="2"
            />

            {/* Parcel Visible Resting Inside Cargo Bay before Door Closes */}
            <motion.rect
              x="200"
              y="108"
              width="16"
              height="14"
              fill="#0A0A0A"
              initial={{ opacity: 0 }}
              animate={{ opacity: stage === 'loading' ? [0, 0, 1] : 0 }}
              transition={{ duration: 1.35, times: [0, 0.85, 1] }}
            />

            {/* ORRA BIT Branding on Van Cargo Side */}
            <text
              x="247"
              y="97"
              textAnchor="middle"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="700"
              letterSpacing="1.6"
              fill="#0A0A0A"
            >
              ORRA BIT
            </text>
            <line x1="218" y1="103" x2="276" y2="103" stroke="#E4E4E7" strokeWidth="1" />
            <text
              x="247"
              y="113"
              textAnchor="middle"
              fontSize="5.5"
              fontFamily="monospace"
              letterSpacing="1.2"
              fill="#71717A"
            >
              ATELIER DISPATCH
            </text>

            {/* Rear Cargo Door (Swings Open -> Snaps Shut) */}
            <motion.g
              style={{ transformOrigin: '196px 68px' }}
              initial={{ rotate: 68 }}
              animate={{
                rotate: stage === 'loading' ? 68 : 0
              }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
            >
              <rect
                x="194"
                y="68"
                width="4"
                height="66"
                fill="#0A0A0A"
              />
            </motion.g>

            {/* Van Cab */}
            <path
              d="M298 68 L324 68 L341 96 L350 103 L350 134 L298 134 Z"
              fill="#FFFFFF"
              stroke="#0A0A0A"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Cab Window */}
            <polygon
              points="304,74 321,74 334,96 304,96"
              fill="#F4F4F5"
              stroke="#0A0A0A"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Driver Silhouette Inside Cab (Visible Once Boarded) */}
            {(stage === 'boarding' || stage === 'driving') && (
              <motion.g
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: stage === 'boarding' ? 0.55 : 0 }}
              >
                <circle cx="315" cy="85" r="4.5" fill="#0A0A0A" />
                <path d="M310 83 L321 83 L322 84.5 L314 84.5 Z" fill="#0A0A0A" />
                <path d="M308 96 C308 90, 322 90, 322 96 Z" fill="#0A0A0A" />
              </motion.g>
            )}

            {/* Cab Door Handle & Headlight */}
            <line x1="305" y1="106" x2="312" y2="106" stroke="#0A0A0A" strokeWidth="1.6" />
            <rect
              x="346"
              y="114"
              width="4"
              height="8"
              fill={stage === 'loading' ? '#E4E4E7' : '#FACC15'}
              stroke="#0A0A0A"
              strokeWidth="1"
            />

            {/* Wheel Wells */}
            <circle cx="224" cy="135" r="15" fill="#FFFFFF" />
            <circle cx="326" cy="135" r="15" fill="#FFFFFF" />

            {/* Rear Wheel */}
            <motion.g
              style={{ transformOrigin: '224px 135px' }}
              animate={stage === 'driving' ? { rotate: 360 } : { rotate: 0 }}
              transition={
                stage === 'driving'
                  ? { duration: 0.45, repeat: Infinity, ease: 'linear' }
                  : { duration: 0.2 }
              }
            >
              <circle cx="224" cy="135" r="13" fill="#0A0A0A" />
              <circle cx="224" cy="135" r="6" fill="#FFFFFF" />
              <line x1="218" y1="135" x2="230" y2="135" stroke="#0A0A0A" strokeWidth="1.2" />
              <line x1="224" y1="129" x2="224" y2="141" stroke="#0A0A0A" strokeWidth="1.2" />
            </motion.g>

            {/* Front Wheel */}
            <motion.g
              style={{ transformOrigin: '326px 135px' }}
              animate={stage === 'driving' ? { rotate: 360 } : { rotate: 0 }}
              transition={
                stage === 'driving'
                  ? { duration: 0.45, repeat: Infinity, ease: 'linear' }
                  : { duration: 0.2 }
              }
            >
              <circle cx="326" cy="135" r="13" fill="#0A0A0A" />
              <circle cx="326" cy="135" r="6" fill="#FFFFFF" />
              <line x1="320" y1="135" x2="332" y2="135" stroke="#0A0A0A" strokeWidth="1.2" />
              <line x1="326" y1="129" x2="326" y2="141" stroke="#0A0A0A" strokeWidth="1.2" />
            </motion.g>
          </motion.g>
        </svg>
      </div>

      {/* Progress Bar & Step Indicators */}
      <div className="space-y-3">
        <div className="w-full h-1 bg-[#E4E4E7] overflow-hidden">
          <div
            className="h-full bg-[#0A0A0A] transition-all duration-700 ease-out"
            style={{ width: progressWidth }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.12em] text-[#71717A]">
          <span className={stage === 'loading' ? 'text-[#0A0A0A] font-semibold' : ''}>
            {isAr ? '١. تحميل الطلب' : '01. Load Order'}
          </span>
          <span className={stage === 'boarding' ? 'text-[#0A0A0A] font-semibold' : ''}>
            {isAr ? '٢. ركوب المندوب' : '02. Board'}
          </span>
          <span className={stage === 'driving' ? 'text-[#0A0A0A] font-semibold' : ''}>
            {isAr ? '٣. انطلاق التوصيل' : '03. Depart'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="text-[11px] font-mono uppercase tracking-[0.12em] text-[#71717A] hover:text-[#0A0A0A] underline underline-offset-4 transition-colors cursor-pointer"
      >
        {isAr ? 'عرض الإيصال مباشرة' : 'View Receipt Now'}
      </button>
    </div>
  );
};
