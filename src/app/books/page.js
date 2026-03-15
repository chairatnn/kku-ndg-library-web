export default async function BookPage({ params }) {
    const { id } = await params;
    const bookId = Number(id);
    if (!Number.isFinite(bookId)) {
        return <div className="text-sm">Invalid id</div>;
    }
    return <div className="text-sm">Book id: {bookId}</div>;
}