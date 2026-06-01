// ==========================================
// TEMPLATE: ĐƯỢC CHUYỂN ĐỔI TỪ LATEX
// Tên file: template.typ
// ==========================================

#let report(
  title: "",
  authors: (),
  date: datetime.today().display("[day]/[month]/[year]"),
  body
) = {
  // 1. THÔNG TIN SIÊU DỮ LIỆU (Metadata)
  set document(title: title, author: authors)

  // 2. CÀI ĐẶT TRANG VÀ FONT CHỮ CƠ BẢN
  set page(paper: "a4")
  set text(font: "New Computer Modern", size: 11pt, lang: "en")

  // 3. CÀI ĐẶT ĐOẠN VĂN (Tương đương \parindent{0pt} và \parskip{.5\baselineskip})
  set par(justify: true, first-line-indent: 0pt, leading: 0.65em)
  show par: set block(spacing: 1.2em) // Khoảng cách giữa các đoạn

// 4. CÀI ĐẶT ĐỀ MỤC (Đã bỏ chữ "Chapter")
  set heading(numbering: "1.1.1")
  show heading.where(level: 1): it => {
    pagebreak(weak: true)
    v(2em)
    text(size: 20pt, weight: "bold")[#counter(heading).display() #it.body]
    v(1.5em)
  }

  show heading.where(level: 2): it => {
    v(1.5em)
    it
    v(0.5em)
  }

  show heading.where(level: 3): it => {
    v(1.2em)
    it
    v(0.3em)
  }

  // 5. CÀI ĐẶT CODE BLOCK (Tương đương package listings + inconsolata)
  show raw.where(block: true): set text(font: "Inconsolata")
  show raw.where(block: true): block.with(
    fill: rgb("#f7f7f7"), // Màu nền xám nhạt
    inset: 10pt,
    radius: 4pt,
    stroke: rgb("#d3d3d3"),
    width: 100%
  )

  // ==========================================
  // TRANG BÌA (Title Page)
  // ==========================================
  page(align(center + horizon)[
    #text(size: 26pt, weight: "bold", title)
    #v(2.5em)
    #text(size: 16pt)[#authors.join(" ")]
    #v(1.5em)
    #text(size: 14pt, date)
  ])

  // ==========================================
  // MỤC LỤC (Table of Contents)
  // ==========================================
  // Thiết lập đánh số La Mã (i, ii, iii) cho mục lục
  set page(numbering: none)
  counter(page).update(1)
  
  outline(title: "Mục lục", indent: auto, depth: 3)
  pagebreak(weak: true)

  // ==========================================
  // NỘI DUNG CHÍNH
  // ==========================================
  // Thiết lập số trang Ả Rập (1, 2, 3...) và tạo Header (pagestyle{long})
  set page(
    numbering: "1",
    header: context {
      // Lấy tiêu đề của Heading level 1 hiện tại
      let current-chapter = query(selector(heading.where(level: 1)).before(here()))
      let chapter-title = if current-chapter.len() > 0 {
        let ch = current-chapter.last()
        // Đã bỏ chữ "Chapter" ở phần header
        [#counter(heading).at(ch.location()).first(). #ch.body]
      } else {
        ""
      }
      
      // Hiển thị Header và kẻ đường ngang (headrule)
      stack(
        dir: ttb,
        spacing: 0.5em,
        line(length: 100%, stroke: 0.5pt)
      )
    }
  )
  
  // Reset số trang về 1 cho phần nội dung
  counter(page).update(1)

  // Chèn nội dung chính của tài liệu vào đây
  body
}