let table;
let globalFetchData = {};
let selectedRowsData = [];
let commentContext = { rowIndex: null, day: null };

$(document).ready(function () {
    fetch('/api/get_hoursheet_data/')
        .then(res => res.json())
        .then(response => {
            globalFetchData = response;
            const processedData = aggregateCurrentWeek(response.data);
            initializeTable(processedData);
        });

    function aggregateCurrentWeek(data) {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Monday
        const endOfWeek = new Date(startOfWeek.getTime() + 6 * 86400000); // Sunday

        console.log("Start of week:", startOfWeek.toISOString().split("T")[0]);
        console.log("End of week:", endOfWeek.toISOString().split("T")[0]);

        const rowsToInclude = [];

        data.forEach(entry => {
            const timeLogged = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun']
                .some(day => parseFloat(entry[day]) > 0);

            if (timeLogged) {
                const total_hours = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun']
                    .reduce((sum, d) => sum + (parseFloat(entry[d]) || 0), 0);
                entry.total_hours = total_hours.toFixed(2);
                rowsToInclude.push(entry);
            }
        });

        // Add one empty row at the bottom
        rowsToInclude.push({
            projects: '', scope: '', title: '', category: '',
            mon: 0, tue: 0, wed: 0, thur: 0, fri: 0, sat: 0, sun: 0,
            total_hours: 0, comments: {}
        });

        console.log("Filtered weekly rows:", rowsToInclude);
        return rowsToInclude;
    }

    function generateSelect(className, options, selected) {
        let opts = options.map(opt => {
            const sel = opt === selected ? 'selected' : '';
            return `<option value="${opt}" ${sel}>${opt}</option>`;
        }).join('');
        return `<select class="inline-filter ${className}"><option value="">SELECT</option>${opts}</select>`;
    }

    function getFilteredOptions(key, filters) {
        return [...new Set(globalFetchData.dropdowns
            .filter(entry => {
                return Object.keys(filters).every(k => filters[k] === '' || entry[k] === filters[k]);
            })
            .map(entry => entry[key])
            .filter(Boolean))];
    }

    function initializeTable(data) {
    // Destroy table if it's already initialized
    if ($.fn.DataTable.isDataTable('#hoursheet-table')) {
        table.clear().destroy(); // Safely clear and destroy
        selectedRowsData = [];
        $('#select-all-rows').prop('checked', false);
    }

    table = $('#hoursheet-table').DataTable({
        data,
        autoWidth: false,
        paging: false,
        ordering: false,
        info: false,
        searching: false,
        select: true,
        columns: [
            {
                data: null,
                orderable: false,
                className: 'row-select-checkbox',
                render: () => `<input type="checkbox" class="row-select-checkbox">` // Only in rows, not the header
            },
            {
                data: 'projects',
                render: (d, t, r) => {
                    const projects = getFilteredOptions('projects', {});
                    return generateSelect('project-filter', projects, d);
                }
            },
            {
                data: 'scope',
                render: (d, t, r) => {
                    const scopes = getFilteredOptions('scope', { projects: r.projects });
                    return generateSelect('scope-filter', scopes, d);
                }
            },
            {
                data: 'title',
                render: (d, t, r) => {
                    const titles = getFilteredOptions('title', { projects: r.projects, scope: r.scope });
                    return generateSelect('task-filter', titles, d);
                }
            },
            {
                data: 'category',
                render: (d, t, r) => {
                    const cats = getFilteredOptions('category', { projects: r.projects, scope: r.scope, title: r.title });
                    return generateSelect('category-filter', cats, d);
                }
            },
            ...['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun'].map(day => ({
                data: day,
                className: 'editable',
                render: function (data, type, row, meta) {
                    return `<div class='time-cell' data-day="${day}">
                            <span>${data}</span>
                        </div>
                        <button class='comment-button' data-day="${day}" data-row="${meta.row}">💬</button>`;
                }
            })),
            { 
                data: 'total_hours',
                render: function (data, type, row) {
                    // Calculate total hours based on the day columns (mon, tue, wed, etc.)
                    const total = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun']
                        .reduce((sum, day) => sum + (parseFloat(row[day]) || 0), 0);

                    return total.toFixed(2);  // Return total hours as a number
                }
            }
        ]
    });

    // Handle "Select All" checkbox
    $('#select-all-rows').on('change', function () {
        const isChecked = $(this).is(':checked');
        selectedRowsData = [];

        $('#hoursheet-table tbody tr').each(function () {
            const $checkbox = $(this).find('input.row-select-checkbox');
            $checkbox.prop('checked', isChecked);

            const rowData = table.row(this).data();
            if (isChecked) {
                selectedRowsData.push(rowData);
            }
        });
    });

    // Handle checkbox selection in the table rows
    $('#hoursheet-table tbody').on('click', 'tr', function () {
        const row = table.row(this);
        if (row.any()) {
            lastSelectedRowData = row.data();  // Store the selected row
        }
    });

    // Handle comments section and rendering of time
    $('#hoursheet-table tbody').on('mouseenter', 'select.inline-filter', function () {
        if (!$(this).hasClass("select2-hidden-accessible")) {
            $(this).select2();
        }
    });

    $('#hoursheet-table tbody').on('change', '.inline-filter', function () {
        const $select = $(this);
        const rowIdx = table.row($select.closest('tr')).index();
        const rowData = table.row(rowIdx).data();
        const colIdx = $select.closest('td').index();
        const colName = table.column(colIdx).dataSrc();

        rowData[colName] = $select.val();

        // Reset dependent fields based on selected value
        if (colName === 'projects') {
            rowData.scope = '';
            rowData.title = '';
            rowData.category = '';
        } else if (colName === 'scope') {
            rowData.title = '';
            rowData.category = '';
        } else if (colName === 'title') {
            rowData.category = '';
        }

        table.row(rowIdx).data(rowData).draw(false);
    });


        // Handle changes in filters
        $('#hoursheet-table tbody').on('change', '.inline-filter', function () {
            const $select = $(this);
            const rowIdx = table.row($select.closest('tr')).index();
            const rowData = table.row(rowIdx).data();
            const colIdx = $select.closest('td').index();
            const colName = table.column(colIdx).dataSrc();

            rowData[colName] = $select.val();

            // Reset dependent fields
            if (colName === 'projects') {
                rowData.scope = '';
                rowData.title = '';
                rowData.category = '';
            } else if (colName === 'scope') {
                rowData.title = '';
                rowData.category = '';
            } else if (colName === 'title') {
                rowData.category = '';
            }

            table.row(rowIdx).data(rowData).draw(false);
        });
    }

    // Ensure that time input updates and total hours are calculated correctly.


    $('#copyRowBtn').on('click', function () {
        if (selectedRowsData.length === 0) {
            alert("Please select one or more rows to copy.");
            return;
        }

        selectedRowsData.forEach(src => {
            const newRow = {
                projects: src.projects,
                scope: src.scope,
                title: src.title,
                category: src.category,
                mon: 0, tue: 0, wed: 0, thur: 0, fri: 0, sat: 0, sun: 0,
                total_hours: 0,
                comments: {}
            };
            table.row.add(newRow);
        });

        table.draw(false);
        alert("Rows copied to Selected week.");
    });

    $('#hoursheet-table').on('change', '.inline-filter', function () {
        const $select = $(this);
        const selectedValue = $select.val();
        const columnIdx = $select.closest('td').index();

        table.column(columnIdx).search(selectedValue).draw();
    });

    $('#hoursheet-table tbody').on('click', 'td.editable', function (e) {
        if ($(e.target).hasClass('comment-button')) return;

        const $cell = $(this);
        const rowIdx = table.row($cell.closest('tr')).index();
        const data = table.row(rowIdx).data();
        const day = $cell.find('.time-cell').data('day');

        if (!day) return;

        // Create input field
        const input = $('<input type="number" min="0" step="0.25">').val(data[day]);

        // Replace the cell content with input field
        $cell.html(`<div class='time-cell' data-day="${day}"></div>`);
        $cell.find('.time-cell').append(input);

        input.focus().on('blur', function () {
            const val = parseFloat(input.val()) || 0; // If empty or invalid, default to 0
            data[day] = val;

            // Recalculate the total hours for the row after the input value is updated
            data.total_hours = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun']
                .reduce((sum, d) => sum + (parseFloat(data[d]) || 0), 0)
                .toFixed(2); // Update total hours

            // Update the row data in the table
            table.row(rowIdx).data(data).draw(false);
        });
    });



    $('#addRowButton').on('click', function () {
        const newRow = {
            projects: '',
            scope: '',
            title: '',
            category: '',
            mon: 0, tue: 0, wed: 0, thur: 0, fri: 0, sat: 0, sun: 0,
            total_hours: 0,
            comments: {}
        };
        table.row.add(newRow).draw(false);
    });

    $('#deleteRowBtn').on('click', async function () {
        if (selectedRowsData.length === 0) {
            alert("Please select one or more rows to delete.");
            return;
        }

        if (!confirm("Are you sure you want to delete the selected rows?")) return;

        for (const rowData of selectedRowsData) {
            const res = await fetch('/api/delete_timesheet_row/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projects: rowData.projects,
                    scope: rowData.scope,
                    title: rowData.title,
                    category: rowData.category
                })
            });

            const json = await res.json();
            if (json.status === 'success') {
                table.rows((idx, data) => (
                    data.projects === rowData.projects &&
                    data.scope === rowData.scope &&
                    data.title === rowData.title &&
                    data.category === rowData.category
                )).remove().draw(false);
            } else {
                alert("Error deleting row: " + json.message);
            }
        }

        selectedRowsData = [];
    });

    $(document).on('click', '.comment-button', function (e) {
        e.stopPropagation();
        commentContext.day = $(this).data('day');
        commentContext.rowIndex = $(this).data('row');
        const rowData = table.row(commentContext.rowIndex).data();
        $('#commentText').val(rowData.comments?.[commentContext.day] || "");
        $('#commentPopup').show();
    });

    $('#saveCommentBtn').on('click', function () {
        const val = $('#commentText').val();
        const rowData = table.row(commentContext.rowIndex).data();
        if (!rowData.comments) rowData.comments = {};
        rowData.comments[commentContext.day] = val;
        table.row(commentContext.rowIndex).data(rowData).draw(false);
        $('#commentPopup').hide();
    });

    $('#closeCommentBtn').on('click', function () {
        $('#commentPopup').hide();
    });

    $('#submitTimesheetButton').on('click', async function () {
        const allData = table.rows().data().toArray();
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);  // Monday

        const payload = [];
        let isValid = true;
        let errorMessage = "";
        let anyColumnModified = false;

        allData.forEach((row, rowIndex) => {
            let rowHasTime = false;
            let rowPayload = [];

            // Collect time + comment info
            ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun'].forEach((day, idx) => {
                const val = parseFloat(row[day]) || 0;
                const comment = row.comments?.[day] || '';

                if (val > 24) {
                    isValid = false;
                    errorMessage = `Row ${rowIndex + 1}: Time for ${day.toUpperCase()} cannot exceed 24 hours.`;
                    return;
                }

                if (val > 0) {
                    rowHasTime = true;

                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + idx);

                    rowPayload.push({
                        projects: row.projects,
                        scope: row.scope,
                        title: row.title,
                        category: row.category,
                        time: val.toFixed(2),
                        comments: comment,  // Optional
                        date1: date.toISOString().split("T")[0]
                    });
                }
            });

            // No time entered at all
            if (!rowHasTime) {
                isValid = false;
                errorMessage = `Row ${rowIndex + 1}: All 7 days are empty. At least one time must be entered.`;
                return;
            }

            // Check mandatory fields
            if (!row.projects || !row.scope || !row.title || (!row.category && row.category_required !== false)) {
                isValid = false;
                errorMessage = `Row ${rowIndex + 1}: Project, Scope, Task, and Category are mandatory.`;
                return;
            }

            // Always push valid row payload (even if header data was modified)
            payload.push(...rowPayload);
            anyColumnModified = true;
        });

        if (!anyColumnModified) {
            alert("Nothing to submit.");
            return;
        }

        if (!isValid) {
            alert(errorMessage);
            return;
        }

        const res = await fetch('/api/submit_timesheet/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (json.message) {
            alert("Saved successfully.");
        } else {
            alert("Submission failed.");
        }
    });


        function fetchWeekData(startDate, endDate) {
        fetch(`/api/get_hoursheet_data/?start_date=${startDate}&end_date=${endDate}`)
            .then(res => res.json())
            .then(response => {
                globalFetchData = response;
                let filtered = response.data;

                const weekRows = filtered.filter(entry => {
                    const hasTime = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun']
                        .some(day => parseFloat(entry[day]) > 0);
                    return true; // Keep all rows including blanks
                });

                weekRows.forEach(entry => {
                    const total = ['mon', 'tue', 'wed', 'thur', 'fri', 'sat', 'sun']
                        .reduce((s, d) => s + (parseFloat(entry[d]) || 0), 0);
                    entry.total_hours = total.toFixed(2);
                });

                if (weekRows.length === 0) {
                    weekRows.push({
                        projects: '', scope: '', title: '', category: '',
                        mon: 0, tue: 0, wed: 0, thur: 0, fri: 0, sat: 0, sun: 0,
                        total_hours: 0, comments: {}
                    });
                }

                // ✅ Check if table is already initialized
                if (table) {
                    table.clear().rows.add(weekRows).draw(false);
                } else {
                    initializeTable(weekRows); // First-time initialization
                }
            });
    }

    

let currentWeekStart = new Date();  // Initialize with current week's start date
let currentWeekEnd = new Date();    // Initialize with current week's end date

// Helper functions for week navigation
function getWeekDates(date) {
    const currentDate = new Date(date);
    const dayOfWeek = currentDate.getDay() || 7; // Get current day (0 is Sunday, 1 is Monday, etc.)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek + 1); // Set to Monday of the current week
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Sunday of the current week

    const startDate = startOfWeek.toISOString().split('T')[0]; // Format to YYYY-MM-DD
    const endDate = endOfWeek.toISOString().split('T')[0]; // Format to YYYY-MM-DD

    return { startDate, endDate };
}

function getYearlyWeek(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diff = date - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const weekNumber = Math.ceil((dayOfYear + 1) / 7);
    return weekNumber;
}

// Update the week dates and info
function updateDateTime() {
    const { startDate, endDate } = getWeekDates(currentWeekStart);
    const yearlyWeek = getYearlyWeek(currentWeekStart);

    // Update the date and time display
    document.getElementById('current-date2').textContent = new Date().toLocaleDateString();
    document.getElementById('current-time2').textContent = new Date().toLocaleTimeString();

    // Update the week info
    document.getElementById('week-start-date').textContent = startDate;
    document.getElementById('week-end-date').textContent = endDate;
    document.getElementById('yearly-week').textContent = yearlyWeek;

    // Load new week data
    fetchWeekData(startDate, endDate);
}

// Navigation buttons for previous and next weeks
document.getElementById('prevWeekButton').addEventListener('click', function () {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7); // Move back one week
    updateDateTime();
});

document.getElementById('nextWeekButton').addEventListener('click', function () {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7); // Move forward one week
    updateDateTime();
});

setInterval(() => {
    document.getElementById('current-date2').textContent = new Date().toLocaleDateString();
    document.getElementById('current-time2').textContent = new Date().toLocaleTimeString();
}, 1000);

// Initial update when the page loads
updateDateTime();

let currentWeekStartDate = new Date();
let currentWeekEndDate = new Date();

$(document).ready(function () {
    $('.filter-select').select2({ placeholder: "Select", allowClear: true });

    function getWeekDates(date) {
        const currentDate = new Date(date);
        const dayOfWeek = currentDate.getDay() || 7;
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - dayOfWeek + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return {
            startDate: startOfWeek.toISOString().split('T')[0],
            endDate: endOfWeek.toISOString().split('T')[0]
        };
    }

    function populateDropdown($dropdown, values) {
        $dropdown.empty().append(`<option value="">Select</option>`);
        if (values.length === 0) {
            $dropdown.append(`<option disabled>No results found</option>`);
            return;
        }
        values.forEach(val => {
            $dropdown.append(`<option value="${val}">${val}</option>`);
        });
        $dropdown.trigger('change.select2');
    }

    function fetchFilterData(startDate, endDate, selected = {}) {
        $.ajax({
            url: '/api/get_filter_data/',
            data: {
                start_date: startDate,
                end_date: endDate,
                project: selected.project || '',
                scope: selected.scope || '',
                task: selected.task || ''
            },
            method: 'GET',
            success: function (data) {
                // Only reset dependent filters to prevent full resets
                if (!selected.project) {
                    populateDropdown($('#project-filters'), data.projects || []);
                    populateDropdown($('#scope-filters'), []);
                    populateDropdown($('#title-filters'), []);
                    populateDropdown($('#category-filters'), []);
                } else if (!selected.scope) {
                    populateDropdown($('#scope-filters'), data.scopes || []);
                    populateDropdown($('#title-filters'), []);
                    populateDropdown($('#category-filters'), []);
                } else if (!selected.task) {
                    populateDropdown($('#title-filters'), data.tasks || []);
                    populateDropdown($('#category-filters'), []);
                } else {
                    populateDropdown($('#category-filters'), data.categories || []);
                }

                filterRowsBasedOnHeaderFilters(); // Update rows after filters update
            },
            error: function (error) {
                console.error("Error fetching filter data:", error);
            }
        });
    }

    const indexes = {
        project: 1,
        scope: 2,
        task: 3,
        category: 4
    };

    function getRowsForSelectedWeek() {
        const rowsForWeek = [];
        $('#hoursheet-table tbody tr').each(function () {
            const $row = $(this);
            const taskDate = new Date($row.data('date'));
            const startDate = new Date(currentWeekStartDate);
            const endDate = new Date(currentWeekEndDate);

            if (taskDate >= startDate && taskDate <= endDate) {
                rowsForWeek.push($row);
            }
        });
        return rowsForWeek;
    }

    function filterRowsBasedOnHeaderFilters() {
        const selectedProject = $('#project-filters').val();
        const selectedScope = $('#scope-filters').val();
        const selectedTask = $('#title-filters').val();
        const selectedCategory = $('#category-filters').val();

        $('#hoursheet-table tbody tr').each(function () {
            const $row = $(this);
            const cells = $row.find('td');

            const project = cells.eq(indexes.project).find('select option:selected').text().trim();
            const scope = cells.eq(indexes.scope).find('select option:selected').text().trim();
            const task = cells.eq(indexes.task).find('select option:selected').text().trim();
            const category = cells.eq(indexes.category).find('select option:selected').text().trim();

            const matches =
                (!selectedProject || project === selectedProject) &&
                (!selectedScope || scope === selectedScope) &&
                (!selectedTask || task === selectedTask) &&
                (!selectedCategory || category === selectedCategory);

            $row.toggle(matches);
        });
    }

    // Cascading filter behavior
    $('#project-filters').on('change', function () {
        $('#scope-filters').val('').trigger('change');
        $('#title-filters').val('').trigger('change');
        $('#category-filters').val('').trigger('change');

        const selectedProject = $(this).val();
        const { startDate, endDate } = getWeekDates(currentWeekStartDate);
        fetchFilterData(startDate, endDate, { project: selectedProject });
    });

    $('#scope-filters').on('change', function () {
        $('#title-filters').val('').trigger('change');
        $('#category-filters').val('').trigger('change');

        const selectedProject = $('#project-filters').val();
        const selectedScope = $(this).val();
        const { startDate, endDate } = getWeekDates(currentWeekStartDate);
        fetchFilterData(startDate, endDate, { project: selectedProject, scope: selectedScope });
    });

    $('#title-filters').on('change', function () {
        $('#category-filters').val('').trigger('change');

        const selectedProject = $('#project-filters').val();
        const selectedScope = $('#scope-filters').val();
        const selectedTask = $(this).val();
        const { startDate, endDate } = getWeekDates(currentWeekStartDate);
        fetchFilterData(startDate, endDate, { project: selectedProject, scope: selectedScope, task: selectedTask });
    });

    $('#category-filters').on('change', function () {
        filterRowsBasedOnHeaderFilters();
    });

    function initializeFilteredTable() {
        $('#hoursheet-table tbody tr').each(function () {
            $(this).show();
        });
        filterRowsBasedOnHeaderFilters();
    }

    function updateDateTime() {
        const { startDate, endDate } = getWeekDates(currentWeekStartDate);
        currentWeekEndDate = new Date(endDate);

        document.getElementById('week-start-date').textContent = startDate;
        document.getElementById('week-end-date').textContent = endDate;

        fetchFilterData(startDate, endDate); // full reset on week change
        fetchWeekData(startDate, endDate);   // loads table data
    }

    $('#prevWeekButton').on('click', function () {
        currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7);
        updateDateTime();
    });

    $('#nextWeekButton').on('click', function () {
        currentWeekStartDate.setDate(currentWeekStartDate.getDate() + 7);
        updateDateTime();
    });

    // Initial Load
    const { startDate, endDate } = getWeekDates(currentWeekStartDate);
    currentWeekEndDate = new Date(endDate);
    fetchFilterData(startDate, endDate);
});


});