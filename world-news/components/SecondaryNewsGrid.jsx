import NewsCard from './NewsCard'

export default function SecondaryNewsGrid({ items }) {
  if (!items?.length) return null

  return (
    <section className="mt-2">

      {/* Section heading */}
      <div className="flex items-center gap-4 mb-7">
        <h2 className="font-display font-bold text-[1.1rem] whitespace-nowrap">
          More Stories
        </h2>
        <div className="flex-1 h-px bg-subtle" />
        <span className="text-[0.62rem] tracking-[0.1em] uppercase text-light whitespace-nowrap">
          {items.length} {items.length === 1 ? 'story' : 'stories'}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <NewsCard key={item.id ?? i} item={item} index={i} />
        ))}
      </div>

    </section>
  )
}
