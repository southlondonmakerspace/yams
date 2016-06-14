{% extends 'base.swig' %}

{% set title = 'Access' %}
{% set heading = title %}

{% block content %}
	<table class="table table-striped table-hover table-condensed">
		<thead>
			<tr>
				<th>Permission</th>
				<th>Members</th>
			</tr>
		</thead>
		<tbody>
			{% for permission in permissions %}
				<tr>
					<td><a href="/view/{{ permission }}">{{ permission }}</a></td>
					<td>{{ accessList[ permission ].length }}</td>
				</tr>
			{% endfor %}
		</tbody>
	</table>
{% endblock %}
