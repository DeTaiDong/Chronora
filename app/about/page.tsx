import Link from "next/link";
import SiteNav from "@/components/SiteNav";

const references = [
  {
    title: "《三命通会》",
    detail: "用于神煞、干支取象等传统命理资料参考。"
  },
  {
    title: "《渊海子平》",
    detail: "用于八字基础格局、十神与干支关系参考。"
  },
  {
    title: "《神峰通考》",
    detail: "用于桃花、华盖、驿马等取象资料参考。"
  },
  {
    title: "八字神煞速查及详解",
    detail: "https://blog.csdn.net/snans/article/details/125460519"
  },
  {
    title: "八字知识之神煞大全解析",
    detail: "https://ly.yishihui.net/bazi/250.htm"
  },
  {
    title: "神煞论命资料",
    detail: "https://www.sf280.com/bazililun/shenshalunming/"
  },
  {
    title: "八字神煞大全",
    detail: "https://zhuanlan.zhihu.com/p/706196420"
  },
  {
    title: "Java 实现八字神煞资料",
    detail: "https://blog.csdn.net/luozhuang/article/details/8678380"
  }
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#fbf8ef_0%,#f4eadf_48%,#e7f0ea_100%)] px-4 py-5 text-ink sm:px-6 lg:px-8">
      <SiteNav />

      <div className="mx-auto max-w-5xl py-8 sm:py-10">
        <header className="rounded-lg border border-white/70 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember">About Chronora</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            关于八字排盘与这个项目
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-moss">
            Chronora 是一个围绕八字排盘、五行、十神与传统神煞资料做的 WebApp。它试着把古籍里的术语和现代交互放在一起，让人可以更轻松地观察一张命盘的结构。
          </p>
        </header>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-lg border border-ink/10 bg-white/80 p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-semibold text-ink">八字是什么</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-moss">
              <p>
                八字，又称四柱命理，通常以出生的年、月、日、时排成四柱，每柱由一个天干与一个地支组成，合计八个字。传统命理会由此观察日主、五行旺衰、十神关系、神煞取象等内容。
              </p>
              <p>
                它并不是现代科学意义上的预测模型，更像是一套古人整理人生经验、时令节气、象征语言与性情观察的传统系统。读它时，与其追求绝对答案，不如把它当作一种自我观察的镜子。
              </p>
            </div>
          </article>

          <article className="rounded-lg border border-ink/10 bg-white/80 p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-semibold text-ink">我为什么做它</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-moss">
              <p>
                做这个项目，主要是因为我对国学、术数和传统文化里的象征体系感兴趣。很多术语看起来玄妙，但背后有一套自洽的语言结构，我想把它整理成一个能看、能玩、能慢慢完善的小工具。
              </p>
              <p>
                这个 WebApp 目前更偏自娱自乐和学习项目：一边写代码，一边把排盘、神煞、五行展示和 AI 解读边界做得更清楚。若你发现算法、资料或表达有问题，非常欢迎指正，也欢迎一起完善。
              </p>
            </div>
          </article>
        </section>

        <section className="mt-5 rounded-lg border border-ink/10 bg-white/80 p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-ink">资料来源</h2>
          <p className="mt-3 text-sm leading-7 text-moss">
            本项目的命理术语、神煞取法和说明文字参考了传统文献及若干公开网页文章。不同流派对部分神煞、取法和解释会有差异，当前实现仍在持续校正。
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {references.map((item) => (
              <div key={item.title} className="rounded-md border border-ink/10 bg-paper/48 p-4">
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-2 break-words text-xs leading-5 text-moss">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-ember/20 bg-white/80 p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-ink">声明与版权</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-moss">
            <p>
              玄学内容仅供娱乐与文化参考，不构成医疗、法律、投资、职业或人生重大决策建议。请不要把命盘解读视作确定事实，也不要用它替代现实中的专业判断。
            </p>
            <p>
              Chronora 当前为个人学习与开源项目。页面设计、代码实现与整理文字版权归项目作者所有；传统文献与网页资料归其原作者或发布方所有。
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="https://github.com/DeTaiDong/Chronora"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-jade"
            >
              查看 GitHub Repo
            </Link>
            <Link
              href="/bazi"
              className="inline-flex items-center justify-center rounded-md border border-ink/15 bg-white/70 px-5 py-3 text-sm font-medium text-ink transition hover:border-jade hover:text-jade"
            >
              开始排盘
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
