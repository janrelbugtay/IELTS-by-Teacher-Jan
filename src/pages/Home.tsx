import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Play, X } from 'lucide-react';

import preStarterImg from '../assets/images/course_pre_starter_1794675068653.jpg';
import startersImg from '../assets/images/course_starters_1794675068963.jpg';
import moversImg from '../assets/images/course_movers_1794675072879.jpg';
import flyersImg from '../assets/images/course_flyers_1794675076193.jpg';
import ketImg from '../assets/images/course_ket_1794675072806.jpg';
import petImg from '../assets/images/course_pet_1794675074585.jpg';
import ieltsImg from '../assets/images/course_ielts_1794675073929.jpg';
import ieltsGirlUniformImg from '../assets/images/ielts_girl_uniform_1794675614675.jpg';

const VIDEOS = [
  { id: '1m3tRXayFhFQGk7P4TgtK0Vc1kwNvk6-V', title: 'Life at Ky Nguyen Era Video 1' },
  { id: '1ec3Ee5VTwWkep1L4-strCnOx3evHoE0e', title: 'Life at Ky Nguyen Era Video 2' },
  { id: '1G39tMBVChShT-bU52uwjHqZV7NYwduhr', title: 'Life at Ky Nguyen Era Video 3' },
  { id: '1jmkstraxzjwScvee4npqHGiRJOHp1DzA', title: 'Life at Ky Nguyen Era Video 4' },
  { id: '1UV_enof7q1KvsshgHkSE1ly5qOZKSLBc', title: 'Life at Ky Nguyen Era Video 5' },
  { id: '1nlYKmV4DLV3xIqRTSYM_AOvvj9ig_qBJ', title: 'Life at Ky Nguyen Era Video 6' },
];

const HERO_SIDE_IMAGES = [
  'https://lh3.googleusercontent.com/d/1ZV8IXVDbZad2fAUwaj_YH1tGYiH8Ep1i',
  'https://lh3.googleusercontent.com/d/16hvnUkj8M1VkFzowovBccarw6KzVUnDv',
  'https://lh3.googleusercontent.com/d/1fbbwBgb3iG0z2ePIttR2upjlecZgvOnx',
];

const GALLERY_IMAGES = [
  'https://lh3.googleusercontent.com/d/1-fCPfoRG-EUkT3DqIXhzFHJxQ-QmTM_7',
  'https://lh3.googleusercontent.com/d/1VetrKou8pNQKGBd-iGHZMlwqALwlRBGG',
  'https://lh3.googleusercontent.com/d/1_3lzGwmEDN56unEeW6S_DGe2vddHiWpV',
  'https://lh3.googleusercontent.com/d/1gucSgi-fzlN-TDFWMI59HGPXFx7uyGaf',
  'https://lh3.googleusercontent.com/d/1iwvqSUapjg5QL4kLlmTSCgv-70aBZc3v',
  'https://lh3.googleusercontent.com/d/1s-QjIXsvF695O5rz2HrgMSwhw5H0QEFn',
  'https://lh3.googleusercontent.com/d/1tOj4WMEFtk634gq18dgylYb5gj_jxK0q',
  'https://lh3.googleusercontent.com/d/1MCsDCEvuik-2gvgKPMXmxkh-nnCzaMG6',
  'https://lh3.googleusercontent.com/d/1kefJhlEcA1KG5B8MJt40EsjOFBH2yX1I',
];

const COURSES = [
  {
    id: 'pre-starter',
    name: 'Pre-Starter',
    image: preStarterImg,
    color: 'from-blue-500 to-cyan-500',
    glow: 'group-hover:shadow-blue-500/20',
  },
  {
    id: 'starters',
    name: 'Starters',
    image: startersImg,
    color: 'from-orange-500 to-amber-500',
    glow: 'group-hover:shadow-orange-500/20',
  },
  {
    id: 'movers',
    name: 'Movers',
    image: moversImg,
    color: 'from-emerald-500 to-green-500',
    glow: 'group-hover:shadow-emerald-500/20',
  },
  {
    id: 'flyers',
    name: 'Flyers',
    image: flyersImg,
    color: 'from-purple-500 to-violet-500',
    glow: 'group-hover:shadow-purple-500/20',
  },
  {
    id: 'ket',
    name: 'KET',
    image: ketImg,
    color: 'from-rose-500 to-pink-500',
    glow: 'group-hover:shadow-rose-500/20',
  },
  {
    id: 'pet',
    name: 'PET',
    image: petImg,
    color: 'from-teal-500 to-cyan-500',
    glow: 'group-hover:shadow-teal-500/20',
  },
  {
    id: 'ielts',
    name: 'IELTS',
    image: ieltsImg,
    color: 'from-indigo-600 to-blue-600',
    glow: 'group-hover:shadow-indigo-500/20',
  },
];

const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const itemReveal = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 110,
      damping: 18,
    },
  },
};

export function Home() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-20 selection:bg-blue-600 selection:text-white">
      {/* Ambient Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -right-32 w-[650px] h-[650px] bg-gradient-to-br from-blue-200/35 via-sky-200/25 to-indigo-200/20 rounded-full blur-[110px]"
        />
        <motion.div
          animate={{
            x: [0, -35, 25, 0],
            y: [0, 35, -25, 0],
            scale: [1, 1.06, 0.95, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -left-32 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-200/30 via-blue-100/25 to-cyan-100/20 rounded-full blur-[110px]"
        />
      </div>

      {/* Hero Section */}
      <section className="pt-8 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-10">
            {/* Left Typography & CTAs */}
            <motion.div
              variants={containerStagger}
              initial="hidden"
              animate="show"
              className="lg:col-span-6 text-center lg:text-left z-10"
            >
              <motion.h1
                variants={itemReveal}
                className="text-4xl sm:text-6xl lg:text-[68px] font-black text-[#0F172A] leading-[1.06] tracking-tight mb-8 sm:mb-10"
              >
                <span className="block">Master</span>
                <motion.span
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  style={{ backgroundSize: '200% auto' }}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-[#1D4ED8] via-[#38BDF8] to-[#2563EB] inline-block py-1"
                >
                  Cambridge English
                </motion.span>
                <span className="block text-2xl sm:text-4xl lg:text-[44px] text-slate-500 font-extrabold mt-2 tracking-tight">
                  from Pre-Starter to IELTS
                </span>
              </motion.h1>

              <motion.div
                variants={itemReveal}
                className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              >
                <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                  <Link
                    to="/courses"
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#3B82F6] text-white rounded-full font-bold text-base shadow-[0_12px_28px_-6px_rgba(37,99,235,0.45)] hover:shadow-[0_18px_36px_-6px_rgba(37,99,235,0.6)] transition-shadow duration-300 flex items-center justify-center gap-2.5 group"
                  >
                    <span>Explore Courses</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                  <Link
                    to="/practice-tests"
                    className="w-full sm:w-auto px-8 py-4 bg-white text-[#0F172A] border border-slate-200/90 rounded-full font-bold text-base shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 flex items-center justify-center"
                  >
                    Take Free Practice Test
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Visual Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.15 }}
              className="lg:col-span-6 w-full relative z-10"
            >
              <div className="relative">
                <motion.div
                  animate={{ opacity: [0.4, 0.75, 0.4], scale: [0.98, 1.04, 0.98] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 via-sky-400/15 to-indigo-500/20 blur-2xl rounded-[40px] -z-10"
                />

                <div className="grid grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
                  {/* Main Campus Artwork */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.015 }}
                    onClick={() => setLightboxImage('https://lh3.googleusercontent.com/d/1bfR_OFAkxKeeHJPmCFETZDo8KKs1m7Qd')}
                    className="col-span-12 sm:col-span-8 h-[360px] sm:h-[460px] rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.12)] relative group cursor-pointer border-4 border-white bg-white"
                  >
                    <img
                      src="https://lh3.googleusercontent.com/d/1bfR_OFAkxKeeHJPmCFETZDo8KKs1m7Qd"
                      alt="Kỷ Nguyên Era Campus"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </motion.div>

                  {/* 3 Student Highlights */}
                  <div className="col-span-12 sm:col-span-4 grid grid-cols-3 sm:grid-cols-1 gap-3 sm:gap-4 sm:h-[460px]">
                    {HERO_SIDE_IMAGES.map((img, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 24, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 120,
                          damping: 16,
                          delay: 0.3 + idx * 0.12,
                        }}
                        whileHover={{ scale: 1.05, y: -4, zIndex: 20 }}
                        onClick={() => setLightboxImage(img)}
                        className="rounded-[20px] sm:rounded-[24px] overflow-hidden shadow-md hover:shadow-xl relative group h-[115px] sm:h-full border-2 border-white cursor-pointer bg-white"
                      >
                        <img
                          src={img}
                          alt="Kỷ Nguyên Era Student"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Courses Section — Clean Visual Cards without Arrows or Clutter */}
      <section className="py-16 sm:py-24 relative">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ type: 'spring', stiffness: 100, damping: 18 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-[44px] font-black text-[#0F172A] tracking-tight">
              Cambridge English Courses
            </h2>
            <div className="w-16 h-1.5 bg-gradient-to-r from-[#1D4ED8] to-[#38BDF8] rounded-full mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-7">
            {COURSES.map((course, index) => {
              const colSpanClass = index < 4 ? 'lg:col-span-3' : 'lg:col-span-4';
              return (
                <motion.div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  initial={{ opacity: 0, y: 36, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    type: 'spring',
                    stiffness: 115,
                    damping: 18,
                    delay: index * 0.06,
                  }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${colSpanClass} group cursor-pointer bg-slate-50/90 hover:bg-white rounded-[28px] p-3.5 border border-slate-200/90 hover:border-blue-200 shadow-[0_8px_28px_-6px_rgba(15,23,42,0.07)] hover:shadow-2xl ${course.glow} transition-all duration-300 flex flex-col relative`}
                >
                  {/* Framed Course Artwork with All-Around Rounded Corners */}
                  <div
                    className={`w-full ${index < 4 ? 'aspect-[4/3]' : 'aspect-[16/10]'} rounded-[20px] overflow-hidden bg-white relative shadow-xs`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${course.color} mix-blend-multiply opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10`}
                    />
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                  </div>

                  {/* Centered Clean Course Title — No Arrows */}
                  <div className="pt-4 pb-2 px-3 flex flex-col items-center justify-center text-center relative z-20">
                    <h3
                      className={`text-xl sm:text-2xl font-extrabold text-[#0F172A] group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r ${course.color} transition-all duration-300 tracking-tight`}
                    >
                      {course.name}
                    </h3>
                    <div
                      className={`h-1 w-8 group-hover:w-16 rounded-full bg-gradient-to-r ${course.color} mt-2.5 transition-all duration-500`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Practice Test Banner — Streamlined & High-Impact */}
      <section className="py-12 sm:py-20 overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ type: 'spring', stiffness: 95, damping: 20 }}
            className="bg-[#0F172A] rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 shadow-[0_28px_60px_-15px_rgba(15,23,42,0.35)]"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/30 rounded-full blur-[100px] pointer-events-none"
            />

            <div className="flex-1 relative z-10 text-center lg:text-left max-w-xl">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-8 leading-[1.12] tracking-tight">
                Simulate the real exam experience at home.
              </h2>

              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Link
                  to="/practice-tests"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#0F172A] rounded-full font-extrabold text-base shadow-xl hover:bg-blue-50 transition-colors duration-300 group"
                >
                  <span>Start Free Test</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 40, rotate: 2 }}
              whileInView={{ opacity: 1, x: 0, rotate: -1 }}
              whileHover={{ rotate: 0, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 100, damping: 18 }}
              className="flex-1 w-full max-w-xl relative z-10"
            >
              <div
                onClick={() => setLightboxImage(ieltsGirlUniformImg)}
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.35)] border border-white/15 cursor-pointer"
              >
                <img
                  src={ieltsGirlUniformImg}
                  alt="Kỷ Nguyên Era IELTS Achiever"
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Life at Kỷ Nguyên Era — Photos & Videos */}
      <section className="py-16 sm:py-24 bg-white border-t border-slate-200/70">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 100, damping: 18 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-[42px] font-black text-[#0F172A] tracking-tight">
              Life at Kỷ Nguyên Era
            </h2>
          </motion.div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {GALLERY_IMAGES.map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 28, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  type: 'spring',
                  stiffness: 110,
                  damping: 18,
                  delay: (idx % 3) * 0.08,
                }}
                whileHover={{ y: -6, scale: 1.015 }}
                onClick={() => setLightboxImage(img)}
                className="relative overflow-hidden rounded-[24px] break-inside-avoid group cursor-pointer shadow-sm hover:shadow-2xl transition-shadow duration-300 border border-slate-100"
              >
                <img
                  src={img}
                  alt="Life at Kỷ Nguyên Era"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>

          {/* Videos */}
          <div className="mt-20 sm:mt-24">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-12"
            >
              <h3 className="text-2xl sm:text-[34px] font-black text-[#0F172A] tracking-tight">
                Campus Videos
              </h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {VIDEOS.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: 'spring',
                    stiffness: 110,
                    damping: 18,
                    delay: (index % 3) * 0.08,
                  }}
                  whileHover={{ y: -6 }}
                  className="relative w-full aspect-video rounded-[24px] overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 border border-slate-200 bg-slate-950"
                >
                  {activeVideo !== video.id ? (
                    <div
                      className="absolute inset-0 cursor-pointer group"
                      onClick={() => setActiveVideo(video.id)}
                    >
                      <img
                        src={`https://drive.google.com/thumbnail?id=${video.id}&sz=w1000`}
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        alt={video.title}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.94 }}
                          className="w-16 h-16 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl group-hover:bg-[#2563EB] transition-colors duration-300"
                        >
                          <Play className="w-7 h-7 text-[#0F172A] group-hover:text-white fill-current ml-1 transition-colors duration-300" />
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black">
                      <iframe
                        src={`https://drive.google.com/file/d/${video.id}/preview?autoplay=1&vq=hd1080`}
                        width="100%"
                        height="100%"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        title={video.title}
                        className="border-0"
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Photos */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => setLightboxImage(null)}
              className="fixed top-5 right-5 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </motion.button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              src={lightboxImage}
              alt="Campus Full View"
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[88vh] rounded-3xl shadow-2xl border-2 border-white/20 object-contain cursor-default"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
