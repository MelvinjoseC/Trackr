let table;
let globalFetchData = {};
let dropdownData1 = {};
let commentDay = null;
let commentRowIndex = null;

$(document).ready(function () {
    fetch('/api/get_hoursheet_data/')
        .then(res => res.json())
        .then(response => {
            dropdownData1 = response.dropdowns;
            globalFetchData = response;
            populateHeaderFilters(response.dropdowns);
            const aggregatedData = aggregateCurrentWeek(response.data);
            initializeTable(aggregatedData);
        });

    function isSameWeek(date) {
        const today = new Date();
        const given = new Date(date);
        const start = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return given >= start && given <= end;
    }

    function aggregateCurrentWeek(data) {
        const weekDataMap = {};

        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        // Step 1: Collect only current week entries
        data.forEach(entry => {
            const date = new Date(entry.date1);
            if (date < startOfWeek || date > endOfWeek) return;

            const key = `${entry.projects}|${entry.scope}|${entry.title}`;
            const weekday = date.getDay();
            const time = parseFloat(entry.time) || 0;

            if (!weekDataMap[key]) {
                weekDataMap[key] = {
                    projects: entry.projects,
                    scope: entry.scope,
                    title: entry.title,
                    category: entry.category || '',
                    comments: {},
                    mon: 0, tue: 0, wed: 0, thur: 0, fri: 0, sat: 0, sun: 0,
                    total_hours: 0
                };
            }

            switch (weekday) {
                case 1: weekDataMap[key].mon += time; break;
                case 2: weekDataMap[key].tue += time; break;
                case 3: weekDataMap[key].wed += time; break;
                case 4: weekDataMap[key].thur += time; break;
                case 5: weekDataMap[key].fri += time; break;
                case 6: weekDataMap[key].sat += time; break;
                case 0: weekDataMap[key].sun += time; break;
            }
        });

        // Step 2: If map is empty (no data for current week), fallback to dropdown-based row creation
        if (Object.keys(weekDataMap).length === 0 && dropdownData1.projects) {
            const tasksSet = new Set(data.map(d => `${d.projects}|${d.scope}|${d.title}`));

            tasksSet.forEach(key => {
                const [project, scope, title] = key.split('|');
                const entry = data.find(d => d.projects === project && d.scope === scope && d.title === title);
                weekDataMap[key] = {
                    projects: project,
                    scope: scope,
                    title: title,
                    category: entry.category || '',
                    comments: {},
                    mon: 0, tue: 0, wed: 0, thur: 0, fri: 0, sat: 0, sun: 0,
                    total_hours: 0
                };
            });
        }

        // Step 3: Compute totals
        for (const key in weekDataMap) {
            const row = weekDataMap[key];
            row.total_hours = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun']
                .reduce((sum, d) => sum + (parseFloat(row[d]) || 0), 0).toFixed(2);
        }

        return Object.values(weekDataMap);
    }


    function populateHeaderFilters(dropdowns) {
        const projectSelect = $('#filter-project');
        const scopeSelect = $('#filter-scope');
        const taskSelect = $('#filter-task');
        const categorySelect = $('#filter-category');

        projectSelect.empty().append('<option value="">All</option>');
        dropdowns.projects.forEach(p => {
            projectSelect.append(`<option value="${p}">${p}</option>`);
        });

        scopeSelect.empty().append('<option value="">All</option>');
        dropdowns.scopes.forEach(s => {
            scopeSelect.append(`<option value="${s}">${s}</option>`);
        });

        taskSelect.empty().append('<option value="">All</option>');
        dropdowns.tasks.forEach(t => {
            taskSelect.append(`<option value="${t}">${t}</option>`);
        });

        categorySelect.empty().append('<option value="">All</option>');
        dropdowns.categories.forEach(c => {
            if (c) categorySelect.append(`<option value="${c}">${c}</option>`);
        });
    }

    function initializeTable(data) {
        table = $('#hoursheet-table').DataTable({
            data: data,
            paging: false,
            searching: false,
            ordering: false,
            info: false,
            lengthChange: false,
            scrollY: '55vh',
            scrollCollapse: true,
            columns: [
                { data: 'projects' },
                { data: 'scope' },
                { data: 'title' },
                { data: 'category' },
                ...['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun'].map(day => ({
                    data: day,
                    className: 'editable',
                    render: function (data, type, row, meta) {
                        return `<div class='time-cell'>
                                    <span>${data}</span>
                                    <button class='comment-button' data-day="${day}" data-row='${meta.row}'>💬</button>
                                </div>`;
                    }
                })),
                { data: 'total_hours' }
            ]
        });
    }

   // Project dropdown change
$('#filter-project').on('change', function () {
    const selectedProject = $(this).val();
    const allData = globalFetchData.data;

    // Clear previous filters
    $('#filter-scope').val('');
    $('#filter-task').val('');
    $('#filter-category').val('');

    // Populate dropdowns for the selected project
    const filteredData = allData.filter(d => d.projects === selectedProject);

    const scopes = [...new Set(filteredData.map(d => d.scope))];
    const tasks = [...new Set(filteredData.map(d => d.title))];
    const categories = [...new Set(filteredData.map(d => d.category || ''))];

    $('#filter-scope').empty().append('<option value="">All</option>');
    scopes.forEach(s => $('#filter-scope').append(`<option value="${s}">${s}</option>`));

    $('#filter-task').empty().append('<option value="">All</option>');
    tasks.forEach(t => $('#filter-task').append(`<option value="${t}">${t}</option>`));

    $('#filter-category').empty().append('<option value="">All</option>');
    categories.forEach(c => {
        if (c) $('#filter-category').append(`<option value="${c}">${c}</option>`);
    });

    // Add all task rows if not already present
    const existingKeys = new Set(table.rows().data().toArray().map(r => `${r.projects}|${r.scope}|${r.title}`));

    filteredData.forEach(entry => {
        const key = `${entry.projects}|${entry.scope}|${entry.title}`;
        if (!existingKeys.has(key) && isSameWeek(entry.date1)) {
            const date = new Date(entry.date1);
            const weekday = date.getDay();
            const time = parseFloat(entry.time) || 0;

            const newRow = {
                projects: entry.projects,
                scope: entry.scope,
                title: entry.title,
                category: entry.category || '',
                mon: 0, tue: 0, wed: 0, thur: 0, fri: 0, sat: 0, sun: 0,
                comments: {},
                total_hours: 0
            };

            const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thur', 'fri', 'sat'];
            newRow[dayKeys[weekday]] = time;

            newRow.total_hours = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun']
                .reduce((sum, d) => sum + (parseFloat(newRow[d]) || 0), 0).toFixed(2);

            table.row.add(newRow);
        }
    });

    table.draw();

    // Apply project filter to narrow view
    table.columns(0).search(selectedProject || '').draw();
});

function reloadCurrentWeekDataOnly() {
    const aggregatedData = aggregateCurrentWeek(globalFetchData.data);
    table.clear().rows.add(aggregatedData).draw();

    // Reset all filters
    $('#filter-project').val('');
    $('#filter-scope').val('');
    $('#filter-task').val('');
    $('#filter-category').val('');
    table.columns().search('').draw();
}


// Scope filter (updated)
$('#filter-scope').on('change', function () {
    const projVal = $('#filter-project').val();
    const scopeVal = $(this).val();

    table.columns(0).search(projVal || '');
    table.columns(1).search(scopeVal || '').draw();
});

// Task filter (updated)
$('#filter-task').on('change', function () {
    const projVal = $('#filter-project').val();
    const scopeVal = $('#filter-scope').val();
    const taskVal = $(this).val();

    table.columns(0).search(projVal || '');
    table.columns(1).search(scopeVal || '');
    table.columns(2).search(taskVal || '').draw();
});

// Category filter (updated)
$('#filter-category').on('change', function () {
    const projVal = $('#filter-project').val();
    const scopeVal = $('#filter-scope').val();
    const taskVal = $('#filter-task').val();
    const catVal = $(this).val();

    table.columns(0).search(projVal || '');
    table.columns(1).search(scopeVal || '');
    table.columns(2).search(taskVal || '');
    table.columns(3).search(catVal || '').draw();
});



    $('#hoursheet-table').on('click', 'td.editable', function (e) {
        const $cell = $(this);
        if ($(e.target).hasClass('comment-button')) return; // ✅ Prevent edit if comment clicked
        if ($cell.find('input').length > 0) return;

        const rowIdx = table.row($cell.closest('tr')).index();
        const rowData = table.row(rowIdx).data();
        const field = table.column($cell.index()).dataSrc();

        if (!['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun'].includes(field)) return;

        const $input = $('<input type="number" step="0.1" min="0">').val($cell.text().trim());
        $cell.html($input);
        $input.focus();

        $input.on('blur', function () {
            const newTime = parseFloat($input.val()) || 0;
            $cell.html(newTime.toFixed(2));
            rowData[field] = newTime;

            rowData.total_hours = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun']
                .reduce((sum, d) => sum + (parseFloat(rowData[d]) || 0), 0).toFixed(2);

            table.row(rowIdx).data(rowData).invalidate().draw(false);

            if (parseFloat(rowData.total_hours) > 0) {
                table.draw();
            }
        });
    });


    let commentContext = { rowIndex: null, day: null };

    // 📝 Comment Button Click
    $(document).on('click', '.comment-button', function (e) {
        e.stopPropagation(); // prevent cell click
        commentContext.day = $(this).data('day');
        commentContext.rowIndex = $(this).data('row');

        const rowData = table.row(commentContext.rowIndex).data();
        const currentComment = rowData.comments?.[commentContext.day] || "";
        $('#commentText').val(currentComment);
        $('#commentPopup').show();
    });

    // 💾 Save Comment
    $('#saveCommentBtn').on('click', function () {
        const newComment = $('#commentText').val();
        const rowData = table.row(commentContext.rowIndex).data();

        if (!rowData.comments) rowData.comments = {};
        rowData.comments[commentContext.day] = newComment;

        table.row(commentContext.rowIndex).data(rowData).invalidate().draw(false);
        $('#commentPopup').hide();
    });

    // ❌ Close Popup
    $('#closeCommentBtn').on('click', function () {
        $('#commentPopup').hide();
    });


    $('#submitTimesheetButton').on('click', function () {
    const allData = table.rows().data().toArray();
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Monday

    const payload = [];

    const days = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun'];

    allData.forEach(row => {
        days.forEach((day, index) => {
            const time = parseFloat(row[day]) || 0;
            const comment = row.comments?.[day] || '';

            if (time > 0 || comment.trim() !== '') {
                const entryDate = new Date(startOfWeek);
                entryDate.setDate(startOfWeek.getDate() + index); // Add day offset

                payload.push({
                    projects: row.projects,
                    scope: row.scope,
                    title: row.title,
                    category: row.category || '',
                    time: time.toFixed(2),
                    comments: comment,
                    date1: entryDate.toISOString().split('T')[0]  // Format as YYYY-MM-DD
                });
            }
        });
    });

    if (payload.length === 0) {
        alert("No valid timesheet entries to save.");
        return;
    }

    fetch('/api/submit_timesheet/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(response => {
    if (response.message) {
        alert("Timesheet saved successfully.");

        // Refresh table to show only current week's non-zero entries
        fetch('/api/get_hoursheet_data/')
            .then(res => res.json())
            .then(response => {
                dropdownData1 = response.dropdowns;
                globalFetchData = response;
                populateHeaderFilters(response.dropdowns);
                reloadCurrentWeekDataOnly();  // 🔁 Reset table view
            });

    } else {
        alert("Save failed.");
    }
})
});
});