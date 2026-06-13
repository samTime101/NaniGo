import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Screen } from '../../components/ui'
import { useT, useLang } from '../../lib/lang'
import { useGame } from '../../store/GameStore'
import type { SubjectId } from '../../types'

// Import illustrations
import MathIllustration from '../../assets/Icons_Illustration/Homepage/Math_Illustration.jpeg'
import NepaliIllustration from '../../assets/Icons_Illustration/Homepage/NepaliWord_illustration.jpeg'
import ScienceIllustration from '../../assets/Icons_Illustration/Homepage/Science_Illustration.jpeg'

interface SubjectBanner {
  id: SubjectId
  illustration: string
  gradient: string
}

const SUBJECT_BANNERS: SubjectBanner[] = [
  {
    id: 'math',
    illustration: MathIllustration,
    gradient: 'from-orange/20 to-orange/5',
  },
  {
    id: 'nepali',
    illustration: NepaliIllustration,
    gradient: 'from-teal/20 to-teal/5',
  },
  {
    id: 'science',
    illustration: ScienceIllustration,
    gradient: 'from-green-400/20 to-green-400/5',
  },
]

export default function SubjectBanner() {
  const nav = useNavigate()
  const t = useT()
  const { lang } = useLang()
  const { packs } = useGame()

  const defaultPacks = packs.filter((p) => p.type === 'default')

  const handleSubjectClick = (subjectId: SubjectId) => {
    const pack = defaultPacks.find((p) => p.subject === subjectId)
    if (pack) {
      nav(`/kid/map/${pack.id}`)
    }
  }

  return (
    <Screen>
      <div className="flex min-h-svh flex-col bg-gradient-to-b from-cream to-white px-5 pb-8 pt-5">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => nav('/kid/home')} className="text-teal">
            <ArrowLeft size={26} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-[#333]">{t('chooseSubject')}</h1>
          </div>
        </div>

        {/* Subject Banners */}
        <div className="flex flex-1 flex-col gap-4">
          {SUBJECT_BANNERS.map((banner, i) => {
            const pack = defaultPacks.find((p) => p.subject === banner.id)
            if (!pack) return null
            
            const title = lang === 'np' ? pack.titleNp : pack.title

            return (
              <motion.button
                key={banner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSubjectClick(banner.id)}
                className={`relative flex h-32 w-full items-center overflow-hidden rounded-3xl bg-gradient-to-r ${banner.gradient} shadow-[0_8px_20px_-8px_rgba(0,0,0,0.15)]`}
              >
                {/* Illustration */}
                <div className="absolute right-0 top-0 h-full w-40 opacity-90">
                  <img
                    src={banner.illustration}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Text Content */}
                <div className="relative z-10 flex flex-col items-start gap-1 px-6">
                  <h2 className="text-2xl font-extrabold text-[#333]">{title}</h2>
                </div>

                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent" />
              </motion.button>
            )
          })}
        </div>
      </div>
    </Screen>
  )
}
