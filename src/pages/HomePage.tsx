export function HomePage() {
    const today = new Date();

    const date = today.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    });

    const datetime = today.toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    });

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col p-4">
                <h1 className="font-semibold text-4xl mb-3">MES Dashbord</h1>
                <h2 className="text-sm text-gray-500">ABC Manufacturing · 생산관리 시스템</h2>
            </div>

            <section className="mes-box">
                <div className="flex flex-col gap-1">
                    <p className="">오늘의 생산 현황</p>

                    <div className="border-zinc-200 my-5 border-t" />

                    <div className="flex justify-between">
                        <p>{date}</p>
                        <p className="text-2xl text-blue-600 font-semibold">{datetime}</p>
                    </div>
                </div>
            </section>

            <section className="mes-box">
                <div className="flex flex-col gap-2">
                    <p>생산현황</p>
                    <div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
                            <div className=" bg-gray-200 rounded-lg p-6">test1</div>
                            <div className=" bg-gray-200 rounded-lg p-6">test2</div>
                            <div className=" bg-gray-200 rounded-lg p-6">test3</div>
                            <div className=" bg-gray-200 rounded-lg p-6">test4</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
