export default async function handler(req, res) {
    if (req.method === 'GET') {
        const fakeData = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' },
        ];
        res.status(200).json(fakeData)
    }
}