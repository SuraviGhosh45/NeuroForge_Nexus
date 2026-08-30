const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Build the list of page numbers/ellipses to display
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // how many neighbors to show around currentPage

    for (let i = 1; i <= totalPages; i++) {
      const isEdge = i === 1 || i === totalPages;
      const isNearCurrent = Math.abs(i - currentPage) <= delta;

      if (isEdge || isNearCurrent) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between border-t border-[#e8eef8]/10 px-6 py-4">
      {/* Page information */}
      <p className="text-sm text-[#e8eef8]/50">
        Page {currentPage} of {totalPages}
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="rounded-md px-2.5 py-2 text-sm text-[#e8eef8]/70 transition hover:bg-[#e8eef8]/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ‹
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-[#e8eef8]/40"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`min-w-[36px] rounded-md px-3 py-2 text-sm transition ${
                page === currentPage
                  ? "bg-[#e8eef8] font-medium text-[#07111f]"
                  : "text-[#e8eef8]/70 hover:bg-[#e8eef8]/5"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="rounded-md px-2.5 py-2 text-sm text-[#e8eef8]/70 transition hover:bg-[#e8eef8]/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;