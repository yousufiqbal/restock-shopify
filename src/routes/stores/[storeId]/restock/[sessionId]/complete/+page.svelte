<script lang="ts">
	import { onMount } from 'svelte';

	let { data } = $props();

	function exportCSV() {
		const headers = ['Product', 'Variant', 'SKU', 'Current Stock', 'Sales 30d', 'Sales 60d', 'Sales 90d', 'Rec Air', 'Rec Sea', 'Actual Restock'];
		const rows = data.restockList.map((i) => [
			i.productTitle,
			i.variantTitle ?? '',
			i.sku ?? '',
			i.currentStock,
			i.sales30,
			i.sales60,
			i.sales90,
			i.recAir,
			i.recSea,
			i.actualRestock ?? 0
		]);
		const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `restock-${data.store.name}-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function exportPDF() {
		const { default: jsPDF } = await import('jspdf');
		const autoTable = (await import('jspdf-autotable')).default;

		const doc = new jsPDF({ orientation: 'landscape' });
		doc.setFontSize(14);
		doc.text(`Restock List — ${data.store.name}`, 14, 16);
		doc.setFontSize(9);
		doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);

		// Load images as base64
		const imgCache = new Map<string, string>();
		async function loadImage(url: string): Promise<string | null> {
			if (imgCache.has(url)) return imgCache.get(url)!;
			try {
				const res = await fetch(url);
				const blob = await res.blob();
				return new Promise((resolve) => {
					const reader = new FileReader();
					reader.onload = () => { imgCache.set(url, reader.result as string); resolve(reader.result as string); };
					reader.readAsDataURL(blob);
				});
			} catch { return null; }
		}

		// Preload all images
		const imageUrls = [...new Set(data.restockList.map((i) => i.variantImageUrl ?? i.productImageUrl).filter(Boolean) as string[])];
		await Promise.all(imageUrls.map(loadImage));

		const bodyRows: (string | { content: string; image?: string })[][] = [];
		for (const item of data.restockList) {
			const imgUrl = item.variantImageUrl ?? item.productImageUrl;
			const imgData = imgUrl ? (imgCache.get(imgUrl) ?? null) : null;
			bodyRows.push([
				imgData ? { content: '', image: imgData } : '',
				item.productTitle,
				item.variantTitle ?? '-',
				item.sku ?? '-',
				String(item.currentStock),
				String(item.sales30),
				String(item.sales60),
				String(item.sales90),
				String(item.recAir),
				String(item.recSea),
				String(item.actualRestock ?? 0)
			]);
		}

		autoTable(doc, {
			startY: 28,
			head: [['', 'Product', 'Variant', 'SKU', 'Stock', '30d', '60d', '90d', 'Rec Air', 'Rec Sea', 'Restock']],
			body: bodyRows,
			columnStyles: { 0: { cellWidth: 20 } },
			didDrawCell: (hookData: any) => {
				if (hookData.section === 'body' && hookData.column.index === 0) {
					const row = data.restockList[hookData.row.index];
					const imgUrl = row?.variantImageUrl ?? row?.productImageUrl;
					if (imgUrl) {
						const b64 = imgCache.get(imgUrl);
						if (b64) {
							try {
								doc.addImage(b64, 'JPEG',
									hookData.cell.x + 1,
									hookData.cell.y + 1,
									18, 18);
							} catch {}
						}
					}
				}
			},
			styles: { fontSize: 8, cellPadding: 3 },
			headStyles: { fillColor: [30, 41, 59] }
		});

		doc.save(`restock-${data.store.name}-${new Date().toISOString().slice(0, 10)}.pdf`);
	}
</script>

<div class="min-h-screen bg-gray-950 p-4 md:p-8">
	<div class="max-w-6xl mx-auto">
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
			<div>
				<div class="flex items-center gap-3 mb-1">
					<a href="/stores/{data.store.id}/restock" class="text-gray-400 hover:text-white text-sm transition">← Sessions</a>
				</div>
				<h1 class="text-2xl font-bold text-white">Restock List — {data.store.name}</h1>
				<p class="text-gray-400 text-sm mt-1">{data.restockList.length} items to restock</p>
			</div>
			<div class="flex gap-3">
				<button onclick={exportCSV}
					class="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
					↓ CSV
				</button>
				<button onclick={exportPDF}
					class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
					↓ PDF
				</button>
			</div>
		</div>

		{#if data.restockList.length === 0}
		<div class="text-center py-16 text-gray-500">
			<div class="text-4xl mb-3">✓</div>
			<p>No items need restocking based on your inputs.</p>
		</div>
		{:else}
		<div class="bg-gray-900 rounded-xl overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-gray-800">
							<th class="text-left text-gray-400 font-medium px-4 py-3 w-12"></th>
							<th class="text-left text-gray-400 font-medium px-4 py-3">Product</th>
							<th class="text-left text-gray-400 font-medium px-4 py-3">Variant</th>
							<th class="text-left text-gray-400 font-medium px-4 py-3">SKU</th>
							<th class="text-right text-gray-400 font-medium px-4 py-3">Stock</th>
							<th class="text-right text-gray-400 font-medium px-4 py-3">30d</th>
							<th class="text-right text-gray-400 font-medium px-4 py-3">60d</th>
							<th class="text-right text-gray-400 font-medium px-4 py-3">90d</th>
							<th class="text-right text-blue-400 font-medium px-4 py-3">✈ Air</th>
							<th class="text-right text-teal-400 font-medium px-4 py-3">🚢 Sea</th>
							<th class="text-right text-white font-medium px-4 py-3">Restock</th>
						</tr>
					</thead>
					<tbody>
						{#each data.restockList as item}
						<tr class="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
							<td class="px-4 py-3">
								{#if item.variantImageUrl ?? item.productImageUrl}
								<img src={item.variantImageUrl ?? item.productImageUrl ?? ''} alt=""
									class="w-10 h-10 object-cover rounded-lg bg-gray-800" />
								{:else}
								<div class="w-10 h-10 rounded-lg bg-gray-800"></div>
								{/if}
							</td>
							<td class="px-4 py-3 text-white font-medium max-w-[200px] truncate">{item.productTitle}</td>
							<td class="px-4 py-3 text-gray-300">{item.variantTitle ?? '-'}</td>
							<td class="px-4 py-3 text-gray-400 font-mono text-xs">{item.sku ?? '-'}</td>
							<td class="px-4 py-3 text-right text-gray-300">{item.currentStock}</td>
							<td class="px-4 py-3 text-right text-gray-300">{item.sales30}</td>
							<td class="px-4 py-3 text-right text-gray-300">{item.sales60}</td>
							<td class="px-4 py-3 text-right text-gray-300">{item.sales90}</td>
							<td class="px-4 py-3 text-right text-blue-300">{item.recAir}</td>
							<td class="px-4 py-3 text-right text-teal-300">{item.recSea}</td>
							<td class="px-4 py-3 text-right text-white font-bold">{item.actualRestock}</td>
						</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
		{/if}
	</div>
</div>
