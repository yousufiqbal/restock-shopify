<script lang="ts">
	let { data } = $props();

	function exportCSV() {
		const headers = ['Product', 'Variant', 'SKU', 'Current Stock', 'Sales 90d', 'Sales 30d', 'Rec Air', 'Rec Sea', 'Actual Restock'];
		const rows = data.restockList.map((i) => [
			i.productTitle, i.variantTitle ?? '', i.sku ?? '',
			i.currentStock, i.sales90, i.sales30,
			i.recAir, i.recSea, i.actualRestock ?? 0
		]);
		const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
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
		doc.setFont('helvetica');
		doc.setFontSize(16);
		doc.text(`Restock List — ${data.store.name}`, 14, 18);
		doc.setFontSize(9);
		doc.setTextColor(150);
		doc.text(`Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 14, 25);
		doc.setTextColor(0);

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

		const imageUrls = [...new Set(
			data.restockList.map((i) => i.variantImageUrl ?? i.productImageUrl).filter(Boolean) as string[]
		)];
		await Promise.all(imageUrls.map(loadImage));

		const bodyRows = data.restockList.map((item) => [
			'', // image cell
			item.productTitle,
			item.variantTitle ?? '-',
			item.sku ?? '-',
			String(item.currentStock),
			String(item.sales90),
			String(item.sales30),
			String(item.recAir),
			String(item.recSea),
			String(item.actualRestock ?? 0)
		]);

		autoTable(doc, {
			startY: 31,
			head: [['', 'Product', 'Variant', 'SKU', 'Stock', '90d', '30d', '✈ Air', '🚢 Sea', 'Restock']],
			body: bodyRows,
			columnStyles: {
				0: { cellWidth: 18 },
				1: { cellWidth: 52 },
				9: { fontStyle: 'bold' }
			},
			didDrawCell: (hookData: any) => {
				if (hookData.section === 'body' && hookData.column.index === 0) {
					const row = data.restockList[hookData.row.index];
					const imgUrl = row?.variantImageUrl ?? row?.productImageUrl;
					if (imgUrl) {
						const b64 = imgCache.get(imgUrl);
						if (b64) {
							try {
								doc.addImage(b64, 'JPEG', hookData.cell.x + 1, hookData.cell.y + 1, 16, 16);
							} catch {}
						}
					}
				}
			},
			styles: { fontSize: 8, cellPadding: 3, minCellHeight: 20 },
			headStyles: { fillColor: [17, 17, 17], textColor: 255, fontSize: 8, fontStyle: 'bold' },
			alternateRowStyles: { fillColor: [249, 250, 251] },
			tableLineColor: [229, 231, 235],
			tableLineWidth: 0.1
		});

		doc.save(`restock-${data.store.name}-${new Date().toISOString().slice(0, 10)}.pdf`);
	}
</script>

<svelte:head><title>Restock list · {data.store.name} · Shopify Restock</title></svelte:head>

<div class="max-w-6xl mx-auto px-4 py-8">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
		<div>
			<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
				<a href="/stores" class="hover:text-gray-900 transition-colors">Stores</a>
				<span class="text-gray-300">/</span>
				<a href="/stores/{data.store.id}/restock" class="hover:text-gray-900 transition-colors">{data.store.name}</a>
				<span class="text-gray-300">/</span>
				<span class="text-gray-900">Restock list</span>
			</div>
			<h1 class="text-2xl font-semibold text-gray-900">Restock List</h1>
			<p class="text-sm text-gray-500 mt-1">
				<span class="font-medium text-gray-900">{data.restockList.length}</span> items to restock
			</p>
		</div>
		<div class="flex gap-2 shrink-0">
			<button onclick={exportCSV}
				class="inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
				<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
				Export CSV
			</button>
			<button onclick={exportPDF}
				class="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
				<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
				Export PDF
			</button>
		</div>
	</div>

	{#if data.restockList.length === 0}
	<div class="bg-white border border-dashed border-gray-200 rounded-xl p-16 text-center">
		<div class="text-3xl mb-3">✓</div>
		<p class="text-sm font-medium text-gray-700">No items to restock</p>
		<p class="text-xs text-gray-400 mt-1">All variants were skipped or have 0 actual restock quantity</p>
	</div>
	{:else}
	<div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-gray-100 bg-gray-50">
						<th class="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-14"></th>
						<th class="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Product</th>
						<th class="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Variant</th>
						<th class="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">SKU</th>
						<th class="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Stock</th>
						<th class="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">90d</th>
						<th class="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">30d</th>
						<th class="text-right text-[11px] font-semibold text-blue-500 uppercase tracking-wide px-4 py-3">✈ Air</th>
						<th class="text-right text-[11px] font-semibold text-teal-500 uppercase tracking-wide px-4 py-3">🚢 Sea</th>
						<th class="text-right text-[11px] font-semibold text-gray-900 uppercase tracking-wide px-4 py-3">Restock</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-50">
					{#each data.restockList as item}
					<tr class="hover:bg-gray-50 transition-colors">
						<td class="px-4 py-3">
							{#if (item.variantImageUrl ?? item.productImageUrl)}
							<img src={item.variantImageUrl ?? item.productImageUrl ?? ''} alt=""
								class="w-10 h-10 object-cover rounded-lg border border-gray-100 bg-gray-50" />
							{:else}
							<div class="w-10 h-10 rounded-lg bg-gray-100"></div>
							{/if}
						</td>
						<td class="px-4 py-3 font-medium text-gray-900 max-w-[200px]">
							<span class="block truncate">{item.productTitle}</span>
						</td>
						<td class="px-4 py-3 text-gray-600">{item.variantTitle ?? '-'}</td>
						<td class="px-4 py-3 text-gray-400 font-mono text-xs">{item.sku ?? '-'}</td>
						<td class="px-4 py-3 text-right text-gray-700 tabular-nums">{item.currentStock}</td>
						<td class="px-4 py-3 text-right text-gray-600 tabular-nums">{item.sales90}</td>
						<td class="px-4 py-3 text-right text-gray-600 tabular-nums">{item.sales30}</td>
						<td class="px-4 py-3 text-right text-blue-600 tabular-nums font-medium">{item.recAir}</td>
						<td class="px-4 py-3 text-right text-teal-600 tabular-nums font-medium">{item.recSea}</td>
						<td class="px-4 py-3 text-right">
							<span class="inline-block bg-black text-white text-xs font-bold px-2.5 py-1 rounded-md tabular-nums min-w-[2rem] text-center">
								{item.actualRestock}
							</span>
						</td>
					</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	{/if}
</div>
