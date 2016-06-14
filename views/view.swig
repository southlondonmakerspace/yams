{% extends 'base.swig' %}

{% set title = 'Permission: ' + permission %}
{% set heading = title %}

{% block content %}
	<form method="post" style="max-width: 300px;">
		<p>
			<label for="tag">Tag: </label>
			<input id="tag" name="tag" type="text" class="form-control" />
		</p>
		<p>
			<button class="btn btn-primary" role="button">Grant</button>
		</p>
	</form>
	<div class="page-header">
		<h2>Members</h2>
	</div>
	<table class="table table-striped table-hover table-condensed">
		<thead>
			<tr>
				<th>Member</th>
				<th>Remove</th>
			</tr>
		</thead>
		<tbody>
			{% for member in members %}
				<tr>
					<td>{{ member }}</td>
					<td><a href="/remove/{{ permission }}/{{ member }}">X</a></td>
				</tr>
			{% endfor %}
		</tbody>
	</table>
{% endblock %}
